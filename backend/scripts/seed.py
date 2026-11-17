from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User
from app.services.users import get_user_by_email

DEMO_EMAIL = "andrewmartin@catcus.com"
DEMO_PASSWORD = "Password@12"
DEMO_NAME = "Andrew Martin"


def main() -> None:
    with SessionLocal() as db:
        if get_user_by_email(db, DEMO_EMAIL) is not None:
            print(f"Demo user already exists: {DEMO_EMAIL}")
            return

        db.add(
            User(
                email=DEMO_EMAIL,
                full_name=DEMO_NAME,
                password_hash=hash_password(DEMO_PASSWORD),
            )
        )
        db.commit()
        print(f"Created demo user: {DEMO_EMAIL}")


if __name__ == "__main__":
    main()