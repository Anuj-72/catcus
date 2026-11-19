from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser, get_current_user
from app.core.config import get_settings
from app.core.tokens import create_access_token
from app.db.session import get_db
from app.models.revoked_token import RevokedToken
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from app.services.users import (
    EmailTaken,
    InvalidCredentials,
    authenticate_user,
    register_user,
)

router = APIRouter()
settings = get_settings()


def _auth_response(user: User, ttl_seconds: int) -> AuthResponse:
    token, expires_in = create_access_token(user, ttl_seconds)
    return AuthResponse(
        access_token=token,
        expires_in=expires_in,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        user = register_user(
            db,
            email=str(payload.email),
            full_name=payload.full_name,
            password=payload.password,
        )
    except EmailTaken as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="email_taken",
        ) from exc
    return _auth_response(user, settings.access_token_ttl)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        user = authenticate_user(
            db,
            email=str(payload.email),
            password=payload.password,
        )
    except InvalidCredentials as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid_credentials",
        ) from exc
    ttl = settings.remember_token_ttl if payload.remember else settings.access_token_ttl
    return _auth_response(user, ttl)


@router.get("/me", response_model=UserResponse)
def me(current: CurrentUser = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current.user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    current: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    db.add(
        RevokedToken(
            jti=current.claims.jti,
            user_id=current.user.id,
            expires_at=datetime.fromtimestamp(
                current.claims.exp, tz=timezone.utc
            ),
        )
    )
    try:
        db.commit()
    except IntegrityError:
        # A concurrent logout already revoked this jti; still a success.
        db.rollback()
    return Response(status_code=status.HTTP_204_NO_CONTENT)