from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import verify_password
from app.db.session import SessionLocal
from app.models.user import User


def register(
    client: TestClient,
    *,
    email: str = "Test@Example.com",
    password: str = "Password@12",
    full_name: str = "Test User",
):
    return client.post(
        "/auth/register",
        json={"full_name": full_name, "email": email, "password": password},
    )


def login(
    client: TestClient,
    *,
    email: str = "test@example.com",
    password: str = "Password@12",
):
    return client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )


def test_register_persists_lowercased_user_with_argon2_hash(client: TestClient) -> None:
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == 3600
    user = body["user"]
    assert user["email"] == "test@example.com"
    assert user["full_name"] == "Test User"
    assert "password_hash" not in user
    assert user["id"]
    assert user["created_at"]

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == "test@example.com"))
        assert user is not None
        assert user.password_hash.startswith("$argon2")
        assert verify_password("Password@12", user.password_hash)


def test_duplicate_email_is_case_insensitive(client: TestClient) -> None:
    assert register(client).status_code == 201

    response = register(client, email="test@example.com")

    assert response.status_code == 409
    assert response.json() == {"detail": "email_taken"}


def test_short_password_is_rejected(client: TestClient) -> None:
    response = register(client, password="short")

    assert response.status_code == 422


def test_blank_full_name_is_rejected(client: TestClient) -> None:
    response = register(client, full_name="   ")

    assert response.status_code == 422


def test_health_reports_ok(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_returns_the_registered_user(client: TestClient) -> None:
    assert register(client).status_code == 201

    response = login(client, email="TEST@example.com")

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == 3600
    user = body["user"]
    assert user["email"] == "test@example.com"
    assert user["full_name"] == "Test User"
    assert "password_hash" not in user


def test_login_rejects_wrong_password_and_unknown_email(client: TestClient) -> None:
    assert register(client).status_code == 201

    wrong_password = login(client, password="WrongPassword@12")
    unknown_email = login(client, email="nobody@example.com")

    for response in (wrong_password, unknown_email):
        assert response.status_code == 401
        assert response.json() == {"detail": "invalid_credentials"}


def test_login_rejects_inactive_user(client: TestClient) -> None:
    assert register(client).status_code == 201
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == "test@example.com"))
        assert user is not None
        user.is_active = False
        db.commit()

    response = login(client)

    assert response.status_code == 401
    assert response.json() == {"detail": "invalid_credentials"}