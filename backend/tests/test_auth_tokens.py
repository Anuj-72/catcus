import uuid
from datetime import datetime, timezone

import jwt
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.revoked_token import RevokedToken
from app.models.user import User

settings = get_settings()


def register(
    client: TestClient,
    *,
    email: str = "token@example.com",
    password: str = "Password@12",
    full_name: str = "Token User",
):
    return client.post(
        "/auth/register",
        json={"full_name": full_name, "email": email, "password": password},
    )


def login(
    client: TestClient,
    *,
    email: str = "token@example.com",
    password: str = "Password@12",
    remember: bool | None = None,
):
    body: dict[str, object] = {"email": email, "password": password}
    if remember is not None:
        body["remember"] = remember
    return client.post("/auth/login", json=body)


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def claims(**overrides: object) -> dict[str, object]:
    now = int(datetime.now(timezone.utc).timestamp())
    payload: dict[str, object] = {
        "sub": str(uuid.uuid4()),
        "email": "token@example.com",
        "name": "Token User",
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + 3600,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }
    payload.update(overrides)
    return payload


def encode(payload: dict[str, object]) -> str:
    return jwt.encode(
        payload, settings.jwt_secret, algorithm=settings.jwt_algorithm
    )


def decode_unverified(token: str) -> dict[str, object]:
    return jwt.decode(token, options={"verify_signature": False})


def test_register_returns_auth_response_and_required_claims(
    client: TestClient,
) -> None:
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == settings.access_token_ttl
    assert body["user"]["email"] == "token@example.com"

    payload = decode_unverified(body["access_token"])
    assert uuid.UUID(payload["sub"]) == uuid.UUID(body["user"]["id"])
    uuid.UUID(payload["jti"])
    assert payload["email"] == "token@example.com"
    assert payload["name"] == "Token User"
    assert payload["iss"] == settings.jwt_issuer
    assert payload["aud"] == settings.jwt_audience
    assert payload["exp"] - payload["iat"] == settings.access_token_ttl


def test_login_returns_token_for_valid_credentials(client: TestClient) -> None:
    assert register(client).status_code == 201

    response = login(client, email="TOKEN@example.com")

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["user"]["email"] == "token@example.com"


def test_login_default_token_lifetime_is_one_hour(client: TestClient) -> None:
    assert register(client).status_code == 201

    payload = decode_unverified(login(client).json()["access_token"])

    assert abs((payload["exp"] - payload["iat"]) - 3600) <= 1


def test_login_remember_me_lifetime_is_thirty_days(client: TestClient) -> None:
    assert register(client).status_code == 201

    response = login(client, remember=True)

    payload = decode_unverified(response.json()["access_token"])
    assert abs((payload["exp"] - payload["iat"]) - 2592000) <= 1


def test_me_returns_the_current_user(client: TestClient) -> None:
    body = register(client).json()

    response = client.get(
        "/auth/me", headers=bearer(body["access_token"])
    )

    assert response.status_code == 200
    assert response.json() == body["user"]


def test_me_rejects_missing_authorization_header(client: TestClient) -> None:
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "invalid_token"}
    assert response.headers["www-authenticate"] == "Bearer"


def test_me_rejects_malformed_token(client: TestClient) -> None:
    response = client.get("/auth/me", headers=bearer("not-a-jwt"))

    assert response.status_code == 401


def test_me_rejects_tampered_token(client: TestClient) -> None:
    token = register(client).json()["access_token"]

    response = client.get("/auth/me", headers=bearer(f"{token}x"))

    assert response.status_code == 401


def test_me_rejects_expired_token(client: TestClient) -> None:
    now = int(datetime.now(timezone.utc).timestamp())
    token = encode(claims(iat=now - 7200, exp=now - 3600))

    response = client.get("/auth/me", headers=bearer(token))

    assert response.status_code == 401


def test_me_rejects_wrong_issuer(client: TestClient) -> None:
    response = client.get(
        "/auth/me", headers=bearer(encode(claims(iss="other")))
    )

    assert response.status_code == 401


def test_me_rejects_wrong_audience(client: TestClient) -> None:
    response = client.get(
        "/auth/me", headers=bearer(encode(claims(aud="other")))
    )

    assert response.status_code == 401


def test_me_rejects_token_missing_required_claim(client: TestClient) -> None:
    payload = claims()
    payload.pop("jti")

    response = client.get("/auth/me", headers=bearer(encode(payload)))

    assert response.status_code == 401


def test_me_rejects_inactive_user_token(client: TestClient) -> None:
    body = register(client).json()
    with SessionLocal() as db:
        user = db.get(User, uuid.UUID(body["user"]["id"]))
        assert user is not None
        user.is_active = False
        db.commit()

    response = client.get(
        "/auth/me", headers=bearer(body["access_token"])
    )

    assert response.status_code == 401


def test_me_rejects_deleted_user_token(client: TestClient) -> None:
    body = register(client).json()
    with SessionLocal() as db:
        user = db.get(User, uuid.UUID(body["user"]["id"]))
        assert user is not None
        db.delete(user)
        db.commit()

    response = client.get(
        "/auth/me", headers=bearer(body["access_token"])
    )

    assert response.status_code == 401


def test_logout_returns_204_and_revokes_the_token(client: TestClient) -> None:
    token = register(client).json()["access_token"]

    response = client.post("/auth/logout", headers=bearer(token))

    assert response.status_code == 204
    assert response.content == b""
    assert client.get("/auth/me", headers=bearer(token)).status_code == 401
    assert client.post("/auth/logout", headers=bearer(token)).status_code == 401


def test_logout_persists_revoked_row_with_user_and_expiry(
    client: TestClient,
) -> None:
    body = register(client).json()
    token = body["access_token"]
    payload = decode_unverified(token)

    assert client.post("/auth/logout", headers=bearer(token)).status_code == 204

    with SessionLocal() as db:
        row = db.scalar(
            select(RevokedToken).where(
                RevokedToken.jti == uuid.UUID(payload["jti"])
            )
        )
        assert row is not None
        assert row.user_id == uuid.UUID(body["user"]["id"])
        assert abs(int(row.expires_at.timestamp()) - payload["exp"]) <= 1


def test_logout_requires_a_bearer_token(client: TestClient) -> None:
    response = client.post("/auth/logout")

    assert response.status_code == 401
    assert response.json() == {"detail": "invalid_token"}