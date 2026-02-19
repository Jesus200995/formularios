from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum

# Enums
class QuestionType(str, Enum):
    TEXT = "text"
    TEXTAREA = "textarea"
    INTEGER = "integer"
    DECIMAL = "decimal"
    RANGE = "range"
    SELECT_ONE = "select_one"
    SELECT_MULTIPLE = "select_multiple"
    DATE = "date"
    TIME = "time"
    DATETIME = "datetime"
    GEOPOINT = "geopoint"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    FILE = "file"
    BARCODE = "barcode"
    RATING = "rating"
    RANKING = "ranking"
    MATRIX = "matrix"
    SIGNATURE = "signature"
    NOTE = "note"
    CALCULATE = "calculate"
    HIDDEN = "hidden"
    EMAIL = "email"
    PHONE = "phone"
    URL = "url"

class FormStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Question Option Schema
class QuestionOption(BaseModel):
    value: str
    label: str
    image: Optional[str] = None

# Validation Schema
class ValidationRule(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    pattern: Optional[str] = None
    message: Optional[str] = None

# Skip Logic Schema
class SkipLogic(BaseModel):
    condition: Optional[str] = None  # Expression to evaluate
    target_question_id: Optional[int] = None
    action: Optional[str] = "show"  # show, hide, skip

# Question Schemas
class QuestionBase(BaseModel):
    question_type: QuestionType
    label: str
    description: Optional[str] = None
    placeholder: Optional[str] = None
    required: bool = False
    order: int = 0
    options: List[QuestionOption] = []
    validation: Optional[ValidationRule] = None
    skip_logic: Optional[SkipLogic] = None
    default_value: Optional[str] = None
    calculation: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    step: Optional[float] = 1
    matrix_rows: List[str] = []
    matrix_columns: List[str] = []
    group_id: Optional[int] = None
    appearance: Dict[str, Any] = {}

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    question_type: Optional[QuestionType] = None
    label: Optional[str] = None
    description: Optional[str] = None
    placeholder: Optional[str] = None
    required: Optional[bool] = None
    order: Optional[int] = None
    options: Optional[List[QuestionOption]] = None
    validation: Optional[ValidationRule] = None
    skip_logic: Optional[SkipLogic] = None
    default_value: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class QuestionResponse(QuestionBase):
    id: int
    form_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Question Group Schemas
class QuestionGroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    order: int = 0
    is_repeatable: bool = False
    repeat_count: Optional[int] = None
    appearance: Dict[str, Any] = {}

class QuestionGroupCreate(QuestionGroupBase):
    pass

class QuestionGroupResponse(QuestionGroupBase):
    id: int
    form_id: int
    questions: List[QuestionResponse] = []
    
    class Config:
        from_attributes = True

# Form Settings Schema
class FormSettings(BaseModel):
    theme: str = "default"
    language: str = "es"
    show_progress: bool = True
    allow_save_draft: bool = True
    show_question_numbers: bool = True
    randomize_questions: bool = False
    one_question_per_page: bool = False
    success_message: str = "¡Gracias por completar el formulario!"
    redirect_url: Optional[str] = None

# Form Schemas
class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: FormStatus = FormStatus.DRAFT
    settings: FormSettings = FormSettings()
    is_public: bool = False
    allow_anonymous: bool = True
    submission_limit: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class FormCreate(FormBase):
    questions: List[QuestionCreate] = []

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[FormStatus] = None
    settings: Optional[FormSettings] = None
    is_public: Optional[bool] = None
    allow_anonymous: Optional[bool] = None
    submission_limit: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class FormResponse(FormBase):
    id: int
    owner_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []
    submission_count: int = 0
    
    class Config:
        from_attributes = True

class FormListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: FormStatus
    is_public: bool
    submission_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Answer Schemas
class AnswerBase(BaseModel):
    question_id: int
    value_text: Optional[str] = None
    value_number: Optional[float] = None
    value_json: Optional[Any] = None
    value_file: Optional[str] = None
    repeat_index: int = 0

class AnswerCreate(AnswerBase):
    pass

class AnswerResponse(AnswerBase):
    id: int
    submission_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Submission Schemas
class SubmissionBase(BaseModel):
    status: str = "completed"
    geolocation: Optional[Dict[str, Any]] = None

class SubmissionCreate(SubmissionBase):
    answers: List[AnswerCreate]

class SubmissionResponse(SubmissionBase):
    id: int
    form_id: int
    user_id: Optional[int]
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    answers: List[AnswerResponse] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Template Schemas
class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_public: bool = True

class TemplateCreate(TemplateBase):
    template_data: Dict[str, Any]

class TemplateResponse(TemplateBase):
    id: int
    template_data: Dict[str, Any]
    created_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Statistics Schemas
class FormStatistics(BaseModel):
    total_submissions: int
    submissions_today: int
    submissions_this_week: int
    submissions_this_month: int
    average_duration: Optional[float]
    completion_rate: float
    question_stats: List[Dict[str, Any]] = []

# Export Schema
class ExportRequest(BaseModel):
    format: str = "xlsx"  # xlsx, csv, json
    include_metadata: bool = True
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
