from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import json
import io

from ..database import get_db
from ..models import Form, Question, Submission, Answer, User, FormStatus
from ..schemas import SubmissionCreate, SubmissionResponse, AnswerCreate, ExportRequest
from .auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/submissions", tags=["Submissions"])

@router.post("/forms/{form_id}", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission(
    form_id: int,
    submission_data: SubmissionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Submit a form response"""
    # Get form
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.questions))
        .where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Check if form is available
    if form.status != FormStatus.PUBLISHED and (not current_user or form.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Form is not published")
    
    # Check anonymous access
    if not form.allow_anonymous and not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check date restrictions
    now = datetime.utcnow()
    if form.start_date and now < form.start_date:
        raise HTTPException(status_code=403, detail="Form not yet available")
    if form.end_date and now > form.end_date:
        raise HTTPException(status_code=403, detail="Form has expired")
    
    # Check submission limit
    if form.submission_limit:
        count_result = await db.execute(
            select(func.count(Submission.id)).where(Submission.form_id == form.id)
        )
        count = count_result.scalar() or 0
        if count >= form.submission_limit:
            raise HTTPException(status_code=403, detail="Form has reached submission limit")
    
    # Validate required questions
    question_ids = {q.id for q in form.questions}
    required_ids = {q.id for q in form.questions if q.required}
    answered_ids = {a.question_id for a in submission_data.answers}
    
    missing_required = required_ids - answered_ids
    if missing_required:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required questions: {missing_required}"
        )
    
    # Create submission
    submission = Submission(
        form_id=form_id,
        user_id=current_user.id if current_user else None,
        status=submission_data.status,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", "")[:500],
        geolocation=submission_data.geolocation or {},
        started_at=now,
        completed_at=now if submission_data.status == "completed" else None
    )
    
    db.add(submission)
    await db.flush()
    
    # Create answers
    for answer_data in submission_data.answers:
        if answer_data.question_id not in question_ids:
            continue  # Skip invalid question IDs
        
        answer = Answer(
            submission_id=submission.id,
            question_id=answer_data.question_id,
            value_text=answer_data.value_text,
            value_number=answer_data.value_number,
            value_json=answer_data.value_json,
            value_file=answer_data.value_file,
            repeat_index=answer_data.repeat_index
        )
        db.add(answer)
    
    await db.commit()
    await db.refresh(submission)
    
    # Load answers
    result = await db.execute(
        select(Submission)
        .options(selectinload(Submission.answers))
        .where(Submission.id == submission.id)
    )
    submission = result.scalar_one()
    
    return submission

@router.get("/forms/{form_id}", response_model=List[SubmissionResponse])
async def list_submissions(
    form_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List submissions for a form"""
    # Check form ownership
    result = await db.execute(
        select(Form).where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Build query
    query = select(Submission).where(Submission.form_id == form_id)
    
    if status:
        query = query.where(Submission.status == status)
    if date_from:
        query = query.where(Submission.created_at >= date_from)
    if date_to:
        query = query.where(Submission.created_at <= date_to)
    
    query = query.options(selectinload(Submission.answers))
    query = query.order_by(Submission.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    submissions = result.scalars().all()
    
    return submissions

@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific submission"""
    result = await db.execute(
        select(Submission)
        .options(selectinload(Submission.answers))
        .join(Form)
        .where(and_(Submission.id == submission_id, Form.owner_id == current_user.id))
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    return submission

@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_submission(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a submission"""
    result = await db.execute(
        select(Submission)
        .join(Form)
        .where(and_(Submission.id == submission_id, Form.owner_id == current_user.id))
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    await db.delete(submission)
    await db.commit()

@router.post("/forms/{form_id}/export")
async def export_submissions(
    form_id: int,
    export_config: ExportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export submissions to various formats"""
    # Check form ownership
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.questions))
        .where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Build query
    query = select(Submission).where(Submission.form_id == form_id)
    
    if export_config.date_from:
        query = query.where(Submission.created_at >= export_config.date_from)
    if export_config.date_to:
        query = query.where(Submission.created_at <= export_config.date_to)
    
    query = query.options(selectinload(Submission.answers))
    query = query.order_by(Submission.created_at.asc())
    
    result = await db.execute(query)
    submissions = result.scalars().all()
    
    # Build question map
    questions = sorted(form.questions, key=lambda x: x.order)
    question_map = {q.id: q for q in questions}
    
    if export_config.format == "json":
        # JSON export
        data = []
        for sub in submissions:
            row = {
                "id": sub.id,
                "submitted_at": sub.created_at.isoformat(),
                "status": sub.status
            }
            if export_config.include_metadata:
                row["ip_address"] = sub.ip_address
                row["geolocation"] = sub.geolocation
            
            for answer in sub.answers:
                q = question_map.get(answer.question_id)
                if q:
                    key = q.label[:50]
                    value = answer.value_text or answer.value_number or answer.value_json
                    row[key] = value
            
            data.append(row)
        
        content = json.dumps(data, indent=2, ensure_ascii=False, default=str)
        return StreamingResponse(
            io.BytesIO(content.encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=form_{form_id}_export.json"}
        )
    
    elif export_config.format == "csv":
        import csv
        
        output = io.StringIO()
        
        # Headers
        headers = ["ID", "Fecha", "Estado"]
        if export_config.include_metadata:
            headers.extend(["IP", "Latitud", "Longitud"])
        headers.extend([q.label[:50] for q in questions])
        
        writer = csv.writer(output)
        writer.writerow(headers)
        
        # Data rows
        for sub in submissions:
            row = [sub.id, sub.created_at.isoformat(), sub.status]
            if export_config.include_metadata:
                geo = sub.geolocation or {}
                row.extend([sub.ip_address, geo.get("lat"), geo.get("lng")])
            
            answer_map = {a.question_id: a for a in sub.answers}
            for q in questions:
                answer = answer_map.get(q.id)
                if answer:
                    value = answer.value_text or answer.value_number or json.dumps(answer.value_json) if answer.value_json else ""
                else:
                    value = ""
                row.append(value)
            
            writer.writerow(row)
        
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8-sig')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=form_{form_id}_export.csv"}
        )
    
    elif export_config.format == "xlsx":
        try:
            import pandas as pd
            from openpyxl import Workbook
            
            # Build DataFrame
            data_rows = []
            for sub in submissions:
                row = {
                    "ID": sub.id,
                    "Fecha": sub.created_at,
                    "Estado": sub.status
                }
                if export_config.include_metadata:
                    geo = sub.geolocation or {}
                    row["IP"] = sub.ip_address
                    row["Latitud"] = geo.get("lat")
                    row["Longitud"] = geo.get("lng")
                
                answer_map = {a.question_id: a for a in sub.answers}
                for q in questions:
                    answer = answer_map.get(q.id)
                    if answer:
                        value = answer.value_text or answer.value_number or answer.value_json
                    else:
                        value = None
                    row[q.label[:50]] = value
                
                data_rows.append(row)
            
            df = pd.DataFrame(data_rows)
            
            output = io.BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            return StreamingResponse(
                output,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename=form_{form_id}_export.xlsx"}
            )
        except ImportError:
            raise HTTPException(status_code=500, detail="Excel export is not available")
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {export_config.format}")

@router.get("/forms/{form_id}/count")
async def count_submissions(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get submission count for a form"""
    result = await db.execute(
        select(Form).where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    count_result = await db.execute(
        select(func.count(Submission.id)).where(Submission.form_id == form_id)
    )
    count = count_result.scalar() or 0
    
    return {"form_id": form_id, "count": count}
