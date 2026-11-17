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


def test_register_persists_lowercased_user_with_argon2_hash(client: TestClient) -> None:
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "test@example.com"
    assert body["full_name"] == "Test User"
    assert "password_hash" not in body
    assert body["id"]
    assert body["created_at"]

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