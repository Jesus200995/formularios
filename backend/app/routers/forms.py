from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import Form, Question, Submission, User, FormStatus as FormStatusModel
from ..schemas import (
    FormCreate, FormUpdate, FormResponse, FormListResponse,
    QuestionCreate, QuestionUpdate, QuestionResponse,
    FormStatistics, FormStatus
)
from .auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/forms", tags=["Forms"])

@router.get("", response_model=List[FormListResponse])
async def list_forms(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[FormStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all forms for current user"""
    query = select(Form).where(Form.owner_id == current_user.id)
    
    if status:
        query = query.where(Form.status == status)
    
    if search:
        query = query.where(Form.title.ilike(f"%{search}%"))
    
    query = query.order_by(Form.updated_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    forms = result.scalars().all()
    
    # Get submission counts
    form_list = []
    for form in forms:
        count_result = await db.execute(
            select(func.count(Submission.id)).where(Submission.form_id == form.id)
        )
        submission_count = count_result.scalar() or 0
        
        form_dict = {
            "id": form.id,
            "title": form.title,
            "description": form.description,
            "status": form.status,
            "is_public": form.is_public,
            "submission_count": submission_count,
            "created_at": form.created_at,
            "updated_at": form.updated_at
        }
        form_list.append(form_dict)
    
    return form_list

@router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
async def create_form(
    form_data: FormCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new form"""
    # Create form
    form = Form(
        title=form_data.title,
        description=form_data.description,
        status=form_data.status,
        settings=form_data.settings.model_dump() if form_data.settings else {},
        is_public=form_data.is_public,
        allow_anonymous=form_data.allow_anonymous,
        submission_limit=form_data.submission_limit,
        start_date=form_data.start_date,
        end_date=form_data.end_date,
        owner_id=current_user.id
    )
    
    db.add(form)
    await db.flush()
    
    # Create questions
    for i, q_data in enumerate(form_data.questions):
        question = Question(
            form_id=form.id,
            question_type=q_data.question_type,
            label=q_data.label,
            description=q_data.description,
            placeholder=q_data.placeholder,
            required=q_data.required,
            order=q_data.order if q_data.order else i,
            options=[opt.model_dump() for opt in q_data.options],
            validation=q_data.validation.model_dump() if q_data.validation else {},
            skip_logic=q_data.skip_logic.model_dump() if q_data.skip_logic else {},
            default_value=q_data.default_value,
            calculation=q_data.calculation,
            min_value=q_data.min_value,
            max_value=q_data.max_value,
            step=q_data.step,
            matrix_rows=q_data.matrix_rows,
            matrix_columns=q_data.matrix_columns,
            appearance=q_data.appearance
        )
        db.add(question)
    
    await db.commit()
    await db.refresh(form)
    
    # Load questions
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.questions))
        .where(Form.id == form.id)
    )
    form = result.scalar_one()
    
    return FormResponse(
        id=form.id,
        title=form.title,
        description=form.description,
        status=form.status,
        settings=form.settings,
        is_public=form.is_public,
        allow_anonymous=form.allow_anonymous,
        submission_limit=form.submission_limit,
        start_date=form.start_date,
        end_date=form.end_date,
        owner_id=form.owner_id,
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=[QuestionResponse.model_validate(q) for q in form.questions],
        submission_count=0
    )

@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get a form by ID"""
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.questions))
        .where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Check access
    if not form.is_public and (not current_user or form.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get submission count
    count_result = await db.execute(
        select(func.count(Submission.id)).where(Submission.form_id == form.id)
    )
    submission_count = count_result.scalar() or 0
    
    return FormResponse(
        id=form.id,
        title=form.title,
        description=form.description,
        status=form.status,
        settings=form.settings,
        is_public=form.is_public,
        allow_anonymous=form.allow_anonymous,
        submission_limit=form.submission_limit,
        start_date=form.start_date,
        end_date=form.end_date,
        owner_id=form.owner_id,
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=[QuestionResponse.model_validate(q) for q in sorted(form.questions, key=lambda x: x.order)],
        submission_count=submission_count
    )

@router.put("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: int,
    form_data: FormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a form"""
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.questions))
        .where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Update fields
    update_data = form_data.model_dump(exclude_unset=True)
    if "settings" in update_data and update_data["settings"]:
        update_data["settings"] = update_data["settings"].model_dump() if hasattr(update_data["settings"], "model_dump") else update_data["settings"]
    
    for field, value in update_data.items():
        setattr(form, field, value)
    
    form.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(form)
    
    count_result = await db.execute(
        select(func.count(Submission.id)).where(Submission.form_id == form.id)
    )
    submission_count = count_result.scalar() or 0
    
    return FormResponse(
        id=form.id,
        title=form.title,
        description=form.description,
        status=form.status,
        settings=form.settings,
        is_public=form.is_public,
        allow_anonymous=form.allow_anonymous,
        submission_limit=form.submission_limit,
        start_date=form.start_date,
        end_date=form.end_date,
        owner_id=form.owner_id,
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=[QuestionResponse.model_validate(q) for q in form.questions],
        submission_count=submission_count
    )

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a form"""
    result = await db.execute(
        select(Form).where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await db.delete(form)
    await db.commit()

@router.post("/{form_id}/duplicate", response_model=FormResponse)
async def duplicate_form(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Duplicate a form"""
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.questions))
        .where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    original = result.scalar_one_or_none()
    
    if not original:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Create duplicate
    new_form = Form(
        title=f"{original.title} (Copia)",
        description=original.description,
        status=FormStatusModel.DRAFT,
        settings=original.settings,
        is_public=False,
        allow_anonymous=original.allow_anonymous,
        owner_id=current_user.id
    )
    
    db.add(new_form)
    await db.flush()
    
    # Duplicate questions
    for q in original.questions:
        new_q = Question(
            form_id=new_form.id,
            question_type=q.question_type,
            label=q.label,
            description=q.description,
            placeholder=q.placeholder,
            required=q.required,
            order=q.order,
            options=q.options,
            validation=q.validation,
            skip_logic=q.skip_logic,
            default_value=q.default_value,
            calculation=q.calculation,
            min_value=q.min_value,
            max_value=q.max_value,
            step=q.step,
            matrix_rows=q.matrix_rows,
            matrix_columns=q.matrix_columns,
            appearance=q.appearance
        )
        db.add(new_q)
    
    await db.commit()
    await db.refresh(new_form)
    
    return await get_form(new_form.id, db, current_user)

@router.get("/{form_id}/statistics", response_model=FormStatistics)
async def get_form_statistics(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get form statistics"""
    result = await db.execute(
        select(Form).where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Get submission counts
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start.replace(day=today_start.day - today_start.weekday())
    month_start = today_start.replace(day=1)
    
    total_result = await db.execute(
        select(func.count(Submission.id)).where(Submission.form_id == form_id)
    )
    total = total_result.scalar() or 0
    
    today_result = await db.execute(
        select(func.count(Submission.id)).where(
            and_(Submission.form_id == form_id, Submission.created_at >= today_start)
        )
    )
    today = today_result.scalar() or 0
    
    week_result = await db.execute(
        select(func.count(Submission.id)).where(
            and_(Submission.form_id == form_id, Submission.created_at >= week_start)
        )
    )
    week = week_result.scalar() or 0
    
    month_result = await db.execute(
        select(func.count(Submission.id)).where(
            and_(Submission.form_id == form_id, Submission.created_at >= month_start)
        )
    )
    month = month_result.scalar() or 0
    
    # Average duration
    avg_result = await db.execute(
        select(func.avg(Submission.duration_seconds)).where(
            and_(Submission.form_id == form_id, Submission.duration_seconds.isnot(None))
        )
    )
    avg_duration = avg_result.scalar()
    
    return FormStatistics(
        total_submissions=total,
        submissions_today=today,
        submissions_this_week=week,
        submissions_this_month=month,
        average_duration=avg_duration,
        completion_rate=100.0,  # Simplified for now
        question_stats=[]
    )

# Question endpoints
@router.post("/{form_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def add_question(
    form_id: int,
    question_data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a question to a form"""
    result = await db.execute(
        select(Form).where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    question = Question(
        form_id=form_id,
        question_type=question_data.question_type,
        label=question_data.label,
        description=question_data.description,
        placeholder=question_data.placeholder,
        required=question_data.required,
        order=question_data.order,
        options=[opt.model_dump() for opt in question_data.options],
        validation=question_data.validation.model_dump() if question_data.validation else {},
        skip_logic=question_data.skip_logic.model_dump() if question_data.skip_logic else {},
        default_value=question_data.default_value,
        calculation=question_data.calculation,
        min_value=question_data.min_value,
        max_value=question_data.max_value,
        step=question_data.step,
        matrix_rows=question_data.matrix_rows,
        matrix_columns=question_data.matrix_columns,
        appearance=question_data.appearance
    )
    
    db.add(question)
    await db.commit()
    await db.refresh(question)
    
    return question

@router.put("/{form_id}/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    form_id: int,
    question_id: int,
    question_data: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a question"""
    result = await db.execute(
        select(Question)
        .join(Form)
        .where(and_(
            Question.id == question_id,
            Question.form_id == form_id,
            Form.owner_id == current_user.id
        ))
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    update_data = question_data.model_dump(exclude_unset=True)
    
    if "options" in update_data:
        update_data["options"] = [opt.model_dump() if hasattr(opt, "model_dump") else opt for opt in update_data["options"]]
    if "validation" in update_data and update_data["validation"]:
        update_data["validation"] = update_data["validation"].model_dump() if hasattr(update_data["validation"], "model_dump") else update_data["validation"]
    if "skip_logic" in update_data and update_data["skip_logic"]:
        update_data["skip_logic"] = update_data["skip_logic"].model_dump() if hasattr(update_data["skip_logic"], "model_dump") else update_data["skip_logic"]
    
    for field, value in update_data.items():
        setattr(question, field, value)
    
    question.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(question)
    
    return question

@router.delete("/{form_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    form_id: int,
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a question"""
    result = await db.execute(
        select(Question)
        .join(Form)
        .where(and_(
            Question.id == question_id,
            Question.form_id == form_id,
            Form.owner_id == current_user.id
        ))
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    await db.delete(question)
    await db.commit()

@router.put("/{form_id}/questions/reorder")
async def reorder_questions(
    form_id: int,
    question_orders: List[dict],  # [{id: 1, order: 0}, ...]
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reorder questions in a form"""
    result = await db.execute(
        select(Form).where(and_(Form.id == form_id, Form.owner_id == current_user.id))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    for item in question_orders:
        await db.execute(
            select(Question)
            .where(and_(Question.id == item["id"], Question.form_id == form_id))
        )
        # Update order using direct SQL for efficiency
        from sqlalchemy import update
        await db.execute(
            update(Question)
            .where(and_(Question.id == item["id"], Question.form_id == form_id))
            .values(order=item["order"])
        )
    
    await db.commit()
    
    return {"message": "Questions reordered successfully"}

# Public form access
@router.get("/public/{form_id}", response_model=FormResponse)
async def get_public_form(
    form_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a public form for filling"""
    result = await db.execute(
        select(Form)
        .options(selectinload(Form.questions))
        .where(and_(Form.id == form_id, Form.is_public == True, Form.status == FormStatusModel.PUBLISHED))
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found or not available")
    
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
    
    return FormResponse(
        id=form.id,
        title=form.title,
        description=form.description,
        status=form.status,
        settings=form.settings,
        is_public=form.is_public,
        allow_anonymous=form.allow_anonymous,
        submission_limit=form.submission_limit,
        start_date=form.start_date,
        end_date=form.end_date,
        owner_id=None,  # Hide owner for public access
        created_at=form.created_at,
        updated_at=form.updated_at,
        questions=[QuestionResponse.model_validate(q) for q in sorted(form.questions, key=lambda x: x.order)],
        submission_count=0
    )
