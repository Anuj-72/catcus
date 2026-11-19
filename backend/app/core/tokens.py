from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import jwt
from jwt import InvalidTokenError

from app.core.config import get_settings
from app.models.user import User

settings = get_settings()

REQUIRED_CLAIMS = ("exp", "iat", "sub", "jti", "iss", "aud")


class InvalidToken(Exception):
    pass


@dataclass(frozen=True)
class TokenClaims:
    sub: UUID
    email: str
    name: str
    jti: UUID
    iat: int
    exp: int
    iss: str
    aud: str


def create_access_token(user: User, ttl_seconds: int) -> tuple[str, int]:
    """Sign a token for `user`; return it with its lifetime in seconds."""
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "jti": str(uuid4()),
            "iat": now,
            "exp": now + timedelta(seconds=ttl_seconds),
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    return token, ttl_seconds


def decode_access_token(token: str) -> TokenClaims:
    """Validate signature, issuer, audience, expiry and claims; raise InvalidToken."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
            options={"require": list(REQUIRED_CLAIMS)},
        )
    except InvalidTokenError as exc:
        raise InvalidToken from exc

    try:
        sub = UUID(payload["sub"])
        jti = UUID(payload["jti"])
        email = payload["email"]
        name = payload["name"]
        iat = payload["iat"]
        exp = payload["exp"]
        iss = payload["iss"]
        aud = payload["aud"]
    except (KeyError, TypeError, ValueError) as exc:
        raise InvalidToken from exc

    if not isinstance(email, str) or not email:
        raise InvalidToken
    if not isinstance(name, str) or not name:
        raise InvalidToken
    if not isinstance(iat, int) or not isinstance(exp, int):
        raise InvalidToken
    if not isinstance(iss, str) or not isinstance(aud, str):
        raise InvalidToken

    return TokenClaims(
        sub=sub,
        email=email,
        name=name,
        jti=jti,
        iat=iat,
        exp=exp,
        iss=iss,
        aud=aud,
    )