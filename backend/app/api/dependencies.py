from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.tokens import InvalidToken, TokenClaims, decode_access_token
from app.db.session import get_db
from app.models.revoked_token import RevokedToken
from app.models.user import User
from app.services.users import get_user_by_id

# auto_error=False so every failure is our 401, not FastAPI's default 403.
bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    user: User
    claims: TokenClaims


def _invalid_token() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid_token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> CurrentUser:
    """Decode the bearer token, reject revoked tokens and inactive users."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _invalid_token()

    try:
        claims = decode_access_token(credentials.credentials)
    except InvalidToken as exc:
        raise _invalid_token() from exc

    if db.get(RevokedToken, claims.jti) is not None:
        raise _invalid_token()

    user = get_user_by_id(db, claims.sub)
    if user is None or not user.is_active:
        raise _invalid_token()

    return CurrentUser(user=user, claims=claims)