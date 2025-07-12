from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base
from datetime import datetime
import uuid
import enum

class ProficiencyLevel(enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"

class UrgencyLevel(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class SwapStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    profile_image_url = Column(String)
    location = Column(String)
    bio = Column(Text)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    skills_offered = relationship("UserSkillOffered", back_populates="user")
    skills_wanted = relationship("UserSkillWanted", back_populates="user")
    swap_requests_sent = relationship("SwapRequest", foreign_keys="SwapRequest.requester_id", back_populates="requester")
    swap_requests_received = relationship("SwapRequest", foreign_keys="SwapRequest.target_id", back_populates="target")
    ratings_given = relationship("Rating", foreign_keys="Rating.rater_id", back_populates="rater")
    ratings_received = relationship("Rating", foreign_keys="Rating.ratee_id", back_populates="ratee")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users_offering = relationship("UserSkillOffered", back_populates="skill")
    users_wanting = relationship("UserSkillWanted", back_populates="skill")

class UserSkillOffered(Base):
    __tablename__ = "user_skills_offered"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"))
    proficiency_level = Column(Enum(ProficiencyLevel), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="skills_offered")
    skill = relationship("Skill", back_populates="users_offering")

class UserSkillWanted(Base):
    __tablename__ = "user_skills_wanted"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"))
    urgency_level = Column(Enum(UrgencyLevel), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="skills_wanted")
    skill = relationship("Skill", back_populates="users_wanting")

class SwapRequest(Base):
    __tablename__ = "swap_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    target_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    requester_skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"))
    target_skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"))
    message = Column(Text)
    status = Column(Enum(SwapStatus), default=SwapStatus.pending)
    scheduled_at = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], back_populates="swap_requests_sent")
    target = relationship("User", foreign_keys=[target_id], back_populates="swap_requests_received")
    requester_skill = relationship("Skill", foreign_keys=[requester_skill_id])
    target_skill = relationship("Skill", foreign_keys=[target_skill_id])

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rater_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    ratee_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    swap_request_id = Column(UUID(as_uuid=True), ForeignKey("swap_requests.id"))
    rating = Column(Integer, nullable=False)  # 1-5 stars
    review = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    rater = relationship("User", foreign_keys=[rater_id], back_populates="ratings_given")
    ratee = relationship("User", foreign_keys=[ratee_id], back_populates="ratings_received")
    swap_request = relationship("SwapRequest")