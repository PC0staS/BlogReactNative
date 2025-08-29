import os
import sqlite3
from typing import Optional, Dict

from argon2 import PasswordHasher  # type: ignore
from argon2.exceptions import VerifyMismatchError  # type: ignore

# Use the db/ folder for the SQLite database, regardless of current working dir
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "db", "users.db"))


def _get_conn():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)


def create_table():
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def check_user_exists(email: str) -> bool:
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id FROM users WHERE email = ?
        """,
        (email,),
    )
    user = cursor.fetchone()
    conn.close()
    return user is not None


def add_user(name: str, email: str, password: str) -> int:
    ph = PasswordHasher()
    hashed_password = ph.hash(password)

    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
        """,
        (name, email, hashed_password),
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return int(user_id) if user_id is not None else -1


def get_user(user_id: int) -> Optional[Dict[str, str]]:
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, name, email FROM users WHERE id = ?
        """,
        (user_id,),
    )
    user = cursor.fetchone()
    conn.close()
    if user:
        return {"id": user[0], "name": user[1], "email": user[2]}
    return None


def get_user_by_email(email: str) -> Optional[Dict[str, str]]:
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, name, email FROM users WHERE email = ?
        """,
        (email,),
    )
    user = cursor.fetchone()
    conn.close()
    if user:
        return {"id": user[0], "name": user[1], "email": user[2]}
    return None


def verify_credentials(email: str, password: str) -> Optional[Dict[str, str]]:
    """Return user dict if credentials are valid, else None."""
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, name, email, password FROM users WHERE email = ?
        """,
        (email,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    user_id, name, email, hashed = row
    ph = PasswordHasher()
    try:
        if ph.verify(hashed, password):
            return {"id": user_id, "name": name, "email": email}
    except VerifyMismatchError:
        return None
    return None

def delete_user(user_id: int) -> bool:
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM users WHERE id = ?
        """,
        (user_id,),
    )
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def clear_users() -> bool:
    conn = _get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM users
        """
    )
    conn.commit()
    conn.close()
    return cursor.rowcount > 0
