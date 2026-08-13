"""
Router: Mock Authentication
------------------------------
Decision: Simple session-cookie-based mock auth using a hardcoded user dict.
IAM, AWS Accounts, and Billing are explicitly out of scope per assignment spec.

Interview talking point: "Authentication is mocked per the assignment's explicit 
scope. In production I would use OAuth2 with JWT tokens (FastAPI's OAuth2PasswordBearer) 
or AWS Cognito for SSO. The current cookie-session approach mimics AWS Console's 
'remember me' browser session pattern without requiring a real identity provider."
"""
from fastapi import APIRouter, Response, Request, HTTPException, status
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Mock user store (production: replace with real DB + bcrypt password hashing)
MOCK_USERS = {
    "admin": {
        "username": "admin",
        "password": "admin123",
        "email": "admin@example.com",
        "account_id": "123456789012",
        "display_name": "AWS Admin",
    }
}

SESSION_COOKIE_NAME = "route53_session"
ACTIVE_SESSIONS: dict = {}  # In-memory session store (production: Redis)


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    username: str
    email: str
    account_id: str
    display_name: str
    logged_in_at: str


@router.post("/login", summary="Mock user login")
async def login(body: LoginRequest, response: Response):
    """
    Authenticate with mock credentials.
    Default credentials: username='admin', password='admin123'
    """
    user = MOCK_USERS.get(body.username)
    if not user or user["password"] != body.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # Create a simple session token
    import uuid
    session_token = str(uuid.uuid4())
    ACTIVE_SESSIONS[session_token] = {
        **user,
        "logged_in_at": datetime.utcnow().isoformat(),
    }

    # Set session cookie (httponly for security)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        httponly=True,
        samesite="lax",
        max_age=86400,  # 24 hours
    )

    return {
        "message": "Login successful",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "account_id": user["account_id"],
            "display_name": user["display_name"],
        },
    }


@router.get("/me", summary="Get current session user")
async def get_me(request: Request):
    """Return the currently authenticated user from session cookie."""
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token or token not in ACTIVE_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please login.",
        )
    session = ACTIVE_SESSIONS[token]
    return {
        "username": session["username"],
        "email": session["email"],
        "account_id": session["account_id"],
        "display_name": session["display_name"],
        "logged_in_at": session["logged_in_at"],
    }


@router.post("/logout", summary="Logout and clear session")
async def logout(request: Request, response: Response):
    """Clear the session cookie and remove from active sessions."""
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token and token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
    response.delete_cookie(SESSION_COOKIE_NAME)
    return {"message": "Logged out successfully."}
