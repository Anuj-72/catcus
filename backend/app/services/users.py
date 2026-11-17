from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


class EmailTaken(Exception):
    pass


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == normalize_email(email)))


def register_user(db: Session, *, email: str, full_name: str, password: str) -> User:
    normalized = normalize_email(email)
    if get_user_by_email(db, normalized) is not None:
        raise EmailTaken

    user = User(
        email=normalized,
        full_name=full_name.strip(),
        password_hash=hash_password(password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        # The unique constraint still covers two concurrent registrations.
        db.rollback()
        raise EmailTaken from exc
    db.refresh(user)
    return user