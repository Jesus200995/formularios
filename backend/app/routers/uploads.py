from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
import uuid
import aiofiles
from pathlib import Path
from typing import List

from ..database import get_db
from ..models import User
from ..config import settings
from .auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg"}
ALLOWED_FILE_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
    "application/zip"
}

def get_upload_path():
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path

def generate_filename(original_filename: str) -> str:
    ext = Path(original_filename).suffix
    return f"{uuid.uuid4().hex}{ext}"

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional)
):
    """Upload an image file"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
    
    if file.size and file.size > settings.max_upload_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.max_upload_size / 1024 / 1024}MB"
        )
    
    filename = generate_filename(file.filename)
    upload_path = get_upload_path() / "images"
    upload_path.mkdir(exist_ok=True)
    
    file_path = upload_path / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "filename": filename,
        "url": f"/api/uploads/images/{filename}",
        "content_type": file.content_type,
        "size": len(content)
    }

@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional)
):
    """Upload an audio file"""
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_AUDIO_TYPES)}"
        )
    
    if file.size and file.size > settings.max_upload_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.max_upload_size / 1024 / 1024}MB"
        )
    
    filename = generate_filename(file.filename)
    upload_path = get_upload_path() / "audio"
    upload_path.mkdir(exist_ok=True)
    
    file_path = upload_path / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "filename": filename,
        "url": f"/api/uploads/audio/{filename}",
        "content_type": file.content_type,
        "size": len(content)
    }

@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional)
):
    """Upload a video file"""
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_VIDEO_TYPES)}"
        )
    
    max_video_size = settings.max_upload_size * 5  # 50MB for videos
    if file.size and file.size > max_video_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {max_video_size / 1024 / 1024}MB"
        )
    
    filename = generate_filename(file.filename)
    upload_path = get_upload_path() / "video"
    upload_path.mkdir(exist_ok=True)
    
    file_path = upload_path / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "filename": filename,
        "url": f"/api/uploads/video/{filename}",
        "content_type": file.content_type,
        "size": len(content)
    }

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional)
):
    """Upload a generic file"""
    all_allowed = ALLOWED_IMAGE_TYPES | ALLOWED_AUDIO_TYPES | ALLOWED_VIDEO_TYPES | ALLOWED_FILE_TYPES
    
    if file.content_type not in all_allowed:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type"
        )
    
    if file.size and file.size > settings.max_upload_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.max_upload_size / 1024 / 1024}MB"
        )
    
    filename = generate_filename(file.filename)
    upload_path = get_upload_path() / "files"
    upload_path.mkdir(exist_ok=True)
    
    file_path = upload_path / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "filename": filename,
        "original_name": file.filename,
        "url": f"/api/uploads/files/{filename}",
        "content_type": file.content_type,
        "size": len(content)
    }

@router.post("/signature")
async def upload_signature(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional)
):
    """Upload a signature image"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Must be an image."
        )
    
    filename = generate_filename(file.filename)
    upload_path = get_upload_path() / "signatures"
    upload_path.mkdir(exist_ok=True)
    
    file_path = upload_path / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "filename": filename,
        "url": f"/api/uploads/signatures/{filename}",
        "content_type": file.content_type,
        "size": len(content)
    }

# Serve uploaded files
@router.get("/images/{filename}")
async def get_image(filename: str):
    file_path = get_upload_path() / "images" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.get("/audio/{filename}")
async def get_audio(filename: str):
    file_path = get_upload_path() / "audio" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.get("/video/{filename}")
async def get_video(filename: str):
    file_path = get_upload_path() / "video" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.get("/files/{filename}")
async def get_file(filename: str):
    file_path = get_upload_path() / "files" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.get("/signatures/{filename}")
async def get_signature(filename: str):
    file_path = get_upload_path() / "signatures" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
