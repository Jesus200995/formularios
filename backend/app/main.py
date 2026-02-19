from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from .config import settings
from .database import init_db
from .routers import auth, forms, submissions, uploads, templates

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    # Create upload directory
    os.makedirs(settings.upload_dir, exist_ok=True)
    
    yield
    # Shutdown
    pass

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    ## FormBuilder API
    
    Una API completa para la creación y gestión de formularios dinámicos,
    similar a KoboToolbox pero con diseño moderno y mejorado.
    
    ### Características principales:
    
    * **Creación de formularios** - Construye formularios con más de 25 tipos de preguntas
    * **Lógica condicional** - Salta preguntas basado en respuestas anteriores
    * **Validación** - Valida respuestas con reglas personalizadas
    * **Recolección de datos** - Recibe respuestas online u offline
    * **Exportación** - Exporta datos en Excel, CSV o JSON
    * **Geolocalización** - Captura coordenadas GPS
    * **Archivos multimedia** - Sube imágenes, audio, video y documentos
    * **Plantillas** - Usa plantillas predefinidas o crea las tuyas
    
    ### Tipos de preguntas soportados:
    
    - Texto, Área de texto, Email, Teléfono, URL
    - Número entero, Decimal, Rango
    - Selección única, Selección múltiple
    - Fecha, Hora, Fecha y hora
    - Punto GPS, Línea GPS, Polígono GPS
    - Imagen, Audio, Video, Archivo
    - Código de barras/QR
    - Calificación, Ordenamiento, Matriz
    - Firma digital
    - Nota informativa, Campo calculado, Campo oculto
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(templates.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/question-types")
async def get_question_types():
    """Get all available question types"""
    return [
        {"type": "text", "label": "Texto corto", "icon": "text", "category": "basic"},
        {"type": "textarea", "label": "Texto largo", "icon": "align-left", "category": "basic"},
        {"type": "email", "label": "Correo electrónico", "icon": "mail", "category": "basic"},
        {"type": "phone", "label": "Teléfono", "icon": "phone", "category": "basic"},
        {"type": "url", "label": "URL", "icon": "link", "category": "basic"},
        
        {"type": "integer", "label": "Número entero", "icon": "hash", "category": "number"},
        {"type": "decimal", "label": "Número decimal", "icon": "percent", "category": "number"},
        {"type": "range", "label": "Rango/Slider", "icon": "sliders", "category": "number"},
        
        {"type": "select_one", "label": "Selección única", "icon": "circle-dot", "category": "choice"},
        {"type": "select_multiple", "label": "Selección múltiple", "icon": "check-square", "category": "choice"},
        {"type": "rating", "label": "Calificación", "icon": "star", "category": "choice"},
        {"type": "ranking", "label": "Ordenamiento", "icon": "list-ordered", "category": "choice"},
        
        {"type": "date", "label": "Fecha", "icon": "calendar", "category": "datetime"},
        {"type": "time", "label": "Hora", "icon": "clock", "category": "datetime"},
        {"type": "datetime", "label": "Fecha y hora", "icon": "calendar-clock", "category": "datetime"},
        
        {"type": "geopoint", "label": "Punto GPS", "icon": "map-pin", "category": "location"},
        
        {"type": "image", "label": "Imagen", "icon": "image", "category": "media"},
        {"type": "audio", "label": "Audio", "icon": "mic", "category": "media"},
        {"type": "video", "label": "Video", "icon": "video", "category": "media"},
        {"type": "file", "label": "Archivo", "icon": "file", "category": "media"},
        {"type": "signature", "label": "Firma", "icon": "pen-tool", "category": "media"},
        {"type": "barcode", "label": "Código QR/Barras", "icon": "qr-code", "category": "media"},
        
        {"type": "matrix", "label": "Matriz", "icon": "grid", "category": "advanced"},
        {"type": "calculate", "label": "Campo calculado", "icon": "calculator", "category": "advanced"},
        {"type": "hidden", "label": "Campo oculto", "icon": "eye-off", "category": "advanced"},
        {"type": "note", "label": "Nota informativa", "icon": "info", "category": "advanced"},
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
