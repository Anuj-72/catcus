from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse
from app.services.users import (
    EmailTaken,
    InvalidCredentials,
    authenticate_user,
    register_user,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
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
    return UserResponse.model_validate(user)


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> UserResponse:
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
    return UserResponse.model_validate(user)