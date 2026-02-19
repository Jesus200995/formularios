from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional

from ..database import get_db
from ..models import FormTemplate, User
from ..schemas import TemplateCreate, TemplateResponse
from .auth import get_current_user

router = APIRouter(prefix="/templates", tags=["Templates"])

# Predefined templates
DEFAULT_TEMPLATES = [
    {
        "name": "Encuesta de Satisfacción",
        "description": "Evalúa la satisfacción de tus clientes o usuarios",
        "category": "feedback",
        "template_data": {
            "title": "Encuesta de Satisfacción",
            "description": "Nos gustaría conocer tu opinión",
            "questions": [
                {"question_type": "rating", "label": "¿Cómo calificarías tu experiencia general?", "required": True, "min_value": 1, "max_value": 5},
                {"question_type": "select_one", "label": "¿Recomendarías nuestro servicio?", "required": True, "options": [{"value": "si", "label": "Sí"}, {"value": "no", "label": "No"}, {"value": "tal_vez", "label": "Tal vez"}]},
                {"question_type": "textarea", "label": "¿Qué podríamos mejorar?", "required": False}
            ]
        }
    },
    {
        "name": "Registro de Evento",
        "description": "Formulario de inscripción para eventos",
        "category": "events",
        "template_data": {
            "title": "Registro de Evento",
            "description": "Completa tu registro",
            "questions": [
                {"question_type": "text", "label": "Nombre completo", "required": True},
                {"question_type": "email", "label": "Correo electrónico", "required": True},
                {"question_type": "phone", "label": "Teléfono", "required": False},
                {"question_type": "select_one", "label": "¿Cómo te enteraste del evento?", "options": [{"value": "redes", "label": "Redes sociales"}, {"value": "email", "label": "Email"}, {"value": "amigo", "label": "Un amigo"}, {"value": "otro", "label": "Otro"}]},
                {"question_type": "textarea", "label": "Comentarios adicionales", "required": False}
            ]
        }
    },
    {
        "name": "Formulario de Contacto",
        "description": "Recibe mensajes de tus visitantes",
        "category": "contact",
        "template_data": {
            "title": "Contáctanos",
            "description": "Envíanos un mensaje y te responderemos pronto",
            "questions": [
                {"question_type": "text", "label": "Nombre", "required": True},
                {"question_type": "email", "label": "Email", "required": True},
                {"question_type": "text", "label": "Asunto", "required": True},
                {"question_type": "textarea", "label": "Mensaje", "required": True}
            ]
        }
    },
    {
        "name": "Encuesta de Campo",
        "description": "Recolección de datos en campo con geolocalización",
        "category": "field",
        "template_data": {
            "title": "Encuesta de Campo",
            "description": "Registro de datos georreferenciados",
            "questions": [
                {"question_type": "geopoint", "label": "Ubicación GPS", "required": True},
                {"question_type": "date", "label": "Fecha de visita", "required": True},
                {"question_type": "image", "label": "Fotografía del sitio", "required": True},
                {"question_type": "select_one", "label": "Estado del sitio", "options": [{"value": "bueno", "label": "Bueno"}, {"value": "regular", "label": "Regular"}, {"value": "malo", "label": "Malo"}]},
                {"question_type": "textarea", "label": "Observaciones", "required": False}
            ]
        }
    },
    {
        "name": "Evaluación de Personal",
        "description": "Evaluación de desempeño de empleados",
        "category": "hr",
        "template_data": {
            "title": "Evaluación de Desempeño",
            "description": "Evaluación trimestral del empleado",
            "questions": [
                {"question_type": "text", "label": "Nombre del empleado", "required": True},
                {"question_type": "text", "label": "Departamento", "required": True},
                {"question_type": "date", "label": "Período de evaluación", "required": True},
                {"question_type": "rating", "label": "Cumplimiento de objetivos", "min_value": 1, "max_value": 5, "required": True},
                {"question_type": "rating", "label": "Trabajo en equipo", "min_value": 1, "max_value": 5, "required": True},
                {"question_type": "rating", "label": "Comunicación", "min_value": 1, "max_value": 5, "required": True},
                {"question_type": "rating", "label": "Puntualidad", "min_value": 1, "max_value": 5, "required": True},
                {"question_type": "textarea", "label": "Fortalezas", "required": False},
                {"question_type": "textarea", "label": "Áreas de mejora", "required": False},
                {"question_type": "signature", "label": "Firma del evaluador", "required": True}
            ]
        }
    },
    {
        "name": "Solicitud de Servicio",
        "description": "Formulario para solicitar servicios o soporte",
        "category": "support",
        "template_data": {
            "title": "Solicitud de Servicio",
            "description": "Complete la información de su solicitud",
            "questions": [
                {"question_type": "text", "label": "Nombre del solicitante", "required": True},
                {"question_type": "email", "label": "Correo electrónico", "required": True},
                {"question_type": "phone", "label": "Teléfono de contacto", "required": True},
                {"question_type": "select_one", "label": "Tipo de servicio", "required": True, "options": [{"value": "tecnico", "label": "Soporte técnico"}, {"value": "consulta", "label": "Consulta general"}, {"value": "reclamo", "label": "Reclamo"}, {"value": "otro", "label": "Otro"}]},
                {"question_type": "select_one", "label": "Prioridad", "required": True, "options": [{"value": "alta", "label": "Alta"}, {"value": "media", "label": "Media"}, {"value": "baja", "label": "Baja"}]},
                {"question_type": "textarea", "label": "Descripción detallada", "required": True},
                {"question_type": "file", "label": "Archivos adjuntos", "required": False}
            ]
        }
    }
]

@router.get("", response_model=List[TemplateResponse])
async def list_templates(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all templates"""
    # Return default templates plus user templates
    templates = []
    
    # Add default templates
    for i, t in enumerate(DEFAULT_TEMPLATES):
        if category and t["category"] != category:
            continue
        if search and search.lower() not in t["name"].lower():
            continue
        
        templates.append(TemplateResponse(
            id=-(i + 1),  # Negative IDs for defaults
            name=t["name"],
            description=t["description"],
            category=t["category"],
            template_data=t["template_data"],
            is_public=True,
            created_by=None,
            created_at=None
        ))
    
    # Get user templates
    query = select(FormTemplate).where(
        (FormTemplate.is_public == True) | (FormTemplate.created_by == current_user.id)
    )
    
    if category:
        query = query.where(FormTemplate.category == category)
    if search:
        query = query.where(FormTemplate.name.ilike(f"%{search}%"))
    
    result = await db.execute(query)
    user_templates = result.scalars().all()
    
    templates.extend(user_templates)
    
    return templates

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a template by ID"""
    # Check if it's a default template
    if template_id < 0:
        idx = abs(template_id) - 1
        if idx < len(DEFAULT_TEMPLATES):
            t = DEFAULT_TEMPLATES[idx]
            return TemplateResponse(
                id=template_id,
                name=t["name"],
                description=t["description"],
                category=t["category"],
                template_data=t["template_data"],
                is_public=True,
                created_by=None,
                created_at=None
            )
    
    result = await db.execute(
        select(FormTemplate).where(FormTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.is_public and template.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return template

@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new template"""
    template = FormTemplate(
        name=template_data.name,
        description=template_data.description,
        category=template_data.category,
        template_data=template_data.template_data,
        is_public=template_data.is_public,
        created_by=current_user.id
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a template"""
    if template_id < 0:
        raise HTTPException(status_code=400, detail="Cannot delete default templates")
    
    result = await db.execute(
        select(FormTemplate).where(
            and_(FormTemplate.id == template_id, FormTemplate.created_by == current_user.id)
        )
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    await db.delete(template)
    await db.commit()

@router.get("/categories/list")
async def list_categories():
    """List all template categories"""
    return [
        {"value": "feedback", "label": "Encuestas y Feedback"},
        {"value": "events", "label": "Eventos y Registros"},
        {"value": "contact", "label": "Contacto"},
        {"value": "field", "label": "Trabajo de Campo"},
        {"value": "hr", "label": "Recursos Humanos"},
        {"value": "support", "label": "Soporte y Servicios"},
        {"value": "education", "label": "Educación"},
        {"value": "health", "label": "Salud"},
        {"value": "other", "label": "Otros"}
    ]
