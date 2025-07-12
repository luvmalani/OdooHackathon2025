from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str
    location: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    
    class Config:
        from_attributes = True

# Skill schemas
class SkillBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: str
    
    class Config:
        from_attributes = True

# User skill schemas
class UserSkillOfferedCreate(BaseModel):
    skill_id: str
    proficiency_level: str
    description: Optional[str] = None

class UserSkillWantedCreate(BaseModel):
    skill_id: str
    urgency_level: str
    description: Optional[str] = None

# Swap request schemas
class SwapRequestCreate(BaseModel):
    target_id: str
    requester_skill_id: Optional[str] = None
    target_skill_id: Optional[str] = None
    message: Optional[str] = None

class SwapRequestResponse(BaseModel):
    id: str
    requester_id: str
    target_id: str
    requester_skill_id: Optional[str] = None
    target_skill_id: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Rating schemas
class RatingCreate(BaseModel):
    ratee_id: str
    swap_request_id: str
    rating: int
    review: Optional[str] = None

class RatingResponse(BaseModel):
    id: str
    rater_id: str
    ratee_id: str
    rating: int
    review: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# WebSocket message schemas
class WebSocketMessage(BaseModel):
    type: str
    data: dict
    user_id: Optional[str] = None
    timestamp: Optional[datetime] = None