from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

from ..database import get_db
from ..models import AppUser
from ..schemas import AppUserCreate, AppUserResponse, AppUserLogin, AppUserToken
from ..config import settings

router = APIRouter(prefix="/app-auth", tags=["App Authentication"])

# OAuth2 scheme for app users
oauth2_scheme_app = OAuth2PasswordBearer(tokenUrl="/api/app-auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


# Lista de territorios válidos
TERRITORIOS = [
    "Acapulco - Centro - Norte - Tierra Caliente",
    "Acayucan",
    "Balancán",
    "Chihuahua / Sonora",
    "Colima",
    "Comalcalco",
    "Córdoba",
    "Costa Chica - Montaña",
    "Costa Grande - Sierra",
    "Durango / Zacatecas",
    "Hidalgo",
    "Istmo",
    "Michoacán",
    "Mixteca",
    "Morelos",
    "Nayarit / Jalisco",
    "Ocosingo",
    "Palenque",
    "Papantla",
    "Pichucalco",
    "Puebla",
    "San Luis Potosí",
    "Sinaloa",
    "Tamaulipas",
    "Tantoyuca",
    "Tapachula",
    "Teapa",
    "Tlaxcala / Estado de México",
    "Tzucacab / Opb",
    "Xpujil",
    "Oficinas Centrales"
]

# Lista de puestos de trabajo válidos
PUESTOS_TRABAJO = [
    "TECNICO PRODUCTIVO",
    "TECNICO SOCIAL",
    "FACILITADOR COMUNITARIO",
    "COORDINACION TERRITORIAL",
    "ESPECIALISTAS PRODUCTIVOS Y SOCIALES"
]


@router.post("/register", response_model=AppUserResponse, status_code=status.HTTP_201_CREATED)
async def register_app_user(user_data: AppUserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new app user"""
    
    # Validate passwords match
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las contraseñas no coinciden"
        )
    
    # Validate CURP format (18 characters alphanumeric)
    if len(user_data.curp) != 18:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El CURP debe tener exactamente 18 caracteres"
        )
    
    # Validate territorio
    if user_data.territorio not in TERRITORIOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Territorio no válido"
        )
    
    # Validate puesto_trabajo
    if user_data.puesto_trabajo not in PUESTOS_TRABAJO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Puesto de trabajo no válido"
        )
    
    # Check if email already exists
    result = await db.execute(select(AppUser).where(AppUser.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo electrónico ya está registrado"
        )
    
    # Check if CURP already exists
    result = await db.execute(select(AppUser).where(AppUser.curp == user_data.curp.upper()))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este CURP ya está registrado"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = AppUser(
        nombre=user_data.nombre.strip().title(),
        apellidos=user_data.apellidos.strip().title(),
        email=user_data.email.lower(),
        curp=user_data.curp.upper(),
        territorio=user_data.territorio,
        puesto_trabajo=user_data.puesto_trabajo,
        supervisor=user_data.supervisor.strip() if user_data.supervisor else None,
        telefono=user_data.telefono.strip(),
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=AppUserToken)
async def login_app_user(credentials: AppUserLogin, db: AsyncSession = Depends(get_db)):
    """Login an app user"""
    
    # Find user by email
    result = await db.execute(select(AppUser).where(AppUser.email == credentials.email.lower()))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta ha sido desactivada. Contacta al administrador."
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "type": "app_user"},
        expires_delta=timedelta(days=30)  # App users get longer sessions
    )
    
    return AppUserToken(
        access_token=access_token,
        token_type="bearer",
        user=AppUserResponse.model_validate(user)
    )


@router.get("/me", response_model=AppUserResponse)
async def get_current_app_user(
    token: str = Depends(oauth2_scheme_app),
    db: AsyncSession = Depends(get_db)
) -> AppUser:
    """Get current authenticated app user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = int(payload.get("sub"))
        user_type = payload.get("type")
        
        if user_type != "app_user":
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception
    
    result = await db.execute(select(AppUser).where(AppUser.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise credentials_exception
    
    return user


async def get_current_app_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_app),
    db: AsyncSession = Depends(get_db)
) -> Optional[AppUser]:
    """Get current app user if authenticated, None otherwise"""
    if not token:
        return None
    try:
        return await get_current_app_user(token, db)
    except HTTPException:
        return None


@router.get("/territorios")
async def get_territorios():
    """Get list of valid territories"""
    return TERRITORIOS


@router.get("/puestos")
async def get_puestos_trabajo():
    """Get list of valid job positions"""
    return PUESTOS_TRABAJO
