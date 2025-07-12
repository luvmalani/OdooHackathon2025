from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional
import json
import uvicorn
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, init_db
from models import User, Skill, UserSkillOffered, UserSkillWanted, SwapRequest, Rating
from schemas import UserCreate, UserLogin, UserResponse, SkillCreate, SkillResponse
from auth import create_access_token, verify_password, get_password_hash, get_current_user, SECRET_KEY
import asyncio

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
            except:
                self.disconnect(user_id)

    async def broadcast(self, message: str):
        disconnected_users = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except:
                disconnected_users.append(user_id)
        
        for user_id in disconnected_users:
            self.disconnect(user_id)

manager = ConnectionManager()

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass

# FastAPI app
app = FastAPI(
    title="TalentTrade API",
    description="A skill exchange platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication routes
@app.post("/api/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    
    # Check if user already exists
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        id=f"user_{int(datetime.now().timestamp())}_{user.username}",
        username=user.username,
        email=user.email,
        password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        created_at=datetime.utcnow()
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.id})
    
    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        access_token=access_token,
        token_type="bearer"
    )

@app.post("/api/login", response_model=UserResponse)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    
    # Find user by username
    result = await db.execute(select(User).where(User.username == user.username))
    db_user = result.scalar_one_or_none()
    
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.id})
    
    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        first_name=db_user.first_name,
        last_name=db_user.last_name,
        access_token=access_token,
        token_type="bearer"
    )

@app.get("/api/user", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        location=current_user.location,
        bio=current_user.bio,
        profile_image_url=current_user.profile_image_url
    )

@app.post("/api/logout")
async def logout():
    return {"message": "Logged out successfully"}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = None
    
    try:
        # Wait for authentication message
        auth_data = await websocket.receive_text()
        auth_message = json.loads(auth_data)
        
        if auth_message.get("type") == "auth":
            token = auth_message.get("token")
            if token:
                try:
                    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                    user_id = payload.get("sub")
                    await manager.connect(websocket, user_id)
                    await websocket.send_text(json.dumps({"type": "auth_success", "user_id": user_id}))
                except JWTError:
                    await websocket.send_text(json.dumps({"type": "auth_error", "message": "Invalid token"}))
                    await websocket.close()
                    return
        
        # Handle messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Broadcast message to all connected clients
            await manager.broadcast(json.dumps({
                "type": "message",
                "user_id": user_id,
                "data": message,
                "timestamp": datetime.utcnow().isoformat()
            }))
            
    except WebSocketDisconnect:
        if user_id:
            manager.disconnect(user_id)

# Skills routes
@app.get("/api/skills", response_model=List[SkillResponse])
async def get_skills(db: AsyncSession = Depends(get_db)):
    skills = await db.execute("SELECT * FROM skills ORDER BY name")
    return skills.fetchall()

@app.post("/api/skills", response_model=SkillResponse)
async def create_skill(
    skill: SkillCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_skill = Skill(
        name=skill.name,
        category=skill.category,
        description=skill.description,
        created_at=datetime.utcnow()
    )
    
    db.add(db_skill)
    await db.commit()
    await db.refresh(db_skill)
    
    return SkillResponse(
        id=db_skill.id,
        name=db_skill.name,
        category=db_skill.category,
        description=db_skill.description
    )

# Users search
@app.get("/api/users/search")
async def search_users(
    q: Optional[str] = None,
    skill_category: Optional[str] = None,
    location: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    # Basic search implementation
    query = "SELECT * FROM users WHERE is_active = true"
    params = []
    
    if q:
        query += " AND (first_name ILIKE %s OR last_name ILIKE %s OR username ILIKE %s)"
        params.extend([f"%{q}%", f"%{q}%", f"%{q}%"])
    
    if location:
        query += " AND location ILIKE %s"
        params.append(f"%{location}%")
    
    query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {(page - 1) * limit}"
    
    result = await db.execute(query, params)
    users = result.fetchall()
    
    return {
        "users": users,
        "total": len(users),
        "page": page,
        "limit": limit
    }

# Swap requests
@app.get("/api/swaps/received")
async def get_received_swaps(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = """
    SELECT sr.*, u.first_name, u.last_name, u.username 
    FROM swap_requests sr
    JOIN users u ON sr.requester_id = u.id
    WHERE sr.target_id = %s AND sr.status = 'pending'
    ORDER BY sr.created_at DESC
    """
    
    result = await db.execute(query, [current_user.id])
    swaps = result.fetchall()
    
    return swaps

# Serve static files (for production)
if os.path.exists("dist/public"):
    app.mount("/", StaticFiles(directory="dist/public", html=True), name="static")

# Development server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True
    )