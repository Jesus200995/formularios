from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class QuestionType(str, enum.Enum):
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

class FormStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    forms = relationship("Form", back_populates="owner")
    submissions = relationship("Submission", back_populates="user")

class Form(Base):
    __tablename__ = "forms"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(SQLEnum(FormStatus), default=FormStatus.DRAFT)
    settings = Column(JSON, default={})  # Form settings (theme, lang, etc)
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    allow_anonymous = Column(Boolean, default=True)
    submission_limit = Column(Integer, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order")
    submissions = relationship("Submission", back_populates="form", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    label = Column(String(500), nullable=False)
    description = Column(Text)
    placeholder = Column(String(255))
    required = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    
    # Options for select, rating, ranking
    options = Column(JSON, default=[])  # [{value, label, image}]
    
    # Validation rules
    validation = Column(JSON, default={})  # {min, max, pattern, message}
    
    # Skip logic / conditional display
    skip_logic = Column(JSON, default={})  # {condition, action, target}
    
    # Default value
    default_value = Column(Text)
    
    # For calculations
    calculation = Column(Text)
    
    # For range/rating
    min_value = Column(Float)
    max_value = Column(Float)
    step = Column(Float, default=1)
    
    # For matrix questions
    matrix_rows = Column(JSON, default=[])
    matrix_columns = Column(JSON, default=[])
    
    # Group settings
    group_id = Column(Integer, ForeignKey("question_groups.id"), nullable=True)
    
    # Appearance settings
    appearance = Column(JSON, default={})  # {style, width, etc}
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    form = relationship("Form", back_populates="questions")
    group = relationship("QuestionGroup", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class QuestionGroup(Base):
    __tablename__ = "question_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    order = Column(Integer, default=0)
    is_repeatable = Column(Boolean, default=False)
    repeat_count = Column(Integer, nullable=True)
    appearance = Column(JSON, default={})
    
    questions = relationship("Question", back_populates="group")

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="completed")  # draft, completed, validated
    
    # Metadata
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    device_info = Column(JSON, default={})
    geolocation = Column(JSON, default={})  # {lat, lng, accuracy}
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    form = relationship("Form", back_populates="submissions")
    user = relationship("User", back_populates="submissions")
    answers = relationship("Answer", back_populates="submission", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    # Store different value types
    value_text = Column(Text)
    value_number = Column(Float)
    value_json = Column(JSON)  # For arrays, objects
    value_file = Column(String(500))  # File path
    
    # Repeat group instance
    repeat_index = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    submission = relationship("Submission", back_populates="answers")
    question = relationship("Question", back_populates="answers")

class FormTemplate(Base):
    __tablename__ = "form_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    template_data = Column(JSON, nullable=False)  # Complete form structure
    is_public = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
