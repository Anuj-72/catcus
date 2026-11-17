from pwdlib import PasswordHash

# Argon2id is pwdlib's recommended current algorithm.
_password_hash = PasswordHash.recommended()


def hash_password(raw: str) -> str:
    return _password_hash.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return _password_hash.verify(raw, hashed)
    except Exception:
        # A malformed stored hash must read as "wrong password", never 500.
        return False