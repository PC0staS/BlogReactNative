import sqlite3
import os
from typing import Optional, Dict, List, Tuple

# Posts DB lives under the repository's db/ folder
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'db', 'posts.db'))


def _get_conn():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)


def create_posts_table() -> None:
    conn = _get_conn()
    c = conn.cursor()
    c.execute(
        '''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thumbnail TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT,
            created_at TEXT
        )
        '''
    )
    # Ensure columns exist for older DBs: add missing columns
    c.execute("PRAGMA table_info('posts')")
    cols = [r[1] for r in c.fetchall()]
    if 'author' not in cols:
        try:
            c.execute("ALTER TABLE posts ADD COLUMN author TEXT")
        except Exception:
            pass
    if 'created_at' not in cols:
        try:
            c.execute("ALTER TABLE posts ADD COLUMN created_at TEXT")
        except Exception:
            pass
    conn.commit()
    conn.close()


def create_post(title: str, content: Dict) -> int:
    """Create a post by writing MDX and thumbnail files under `posts/` and
    inserting a DB row. Returns the new row id.

    `content` must be a dict with keys:
      - 'mdx': str
      - 'thumbnail_bytes': bytes
      - 'thumbnail_ext': str (e.g. '.png')
    """
    import uuid
    # Ensure the posts table exists (safe to call multiple times)
    try:
        create_posts_table()
    except Exception:
        # best-effort; continue and let DB errors surface
        pass
    posts_dir = os.path.join(os.path.dirname(__file__), '..', 'posts')
    os.makedirs(posts_dir, exist_ok=True)

    mdx_content = content['mdx']
    thumbnail_bytes = content['thumbnail_bytes']
    thumbnail_ext = content['thumbnail_ext']

    post_id = str(uuid.uuid4())
    mdx_filename = f"{post_id}.mdx"
    thumbnail_filename = f"{post_id}{thumbnail_ext}"

    mdx_path = os.path.abspath(os.path.join(posts_dir, mdx_filename))
    thumbnail_path = os.path.abspath(os.path.join(posts_dir, thumbnail_filename))

    # write files
    with open(mdx_path, 'w', encoding='utf-8') as f:
        f.write(mdx_content)
    with open(thumbnail_path, 'wb') as f:
        f.write(thumbnail_bytes)

    # store paths relative to the code directory so they are portable
    rel_mdx_path = os.path.relpath(mdx_path, os.path.dirname(__file__))
    rel_thumbnail_path = os.path.relpath(thumbnail_path, os.path.dirname(__file__))

    # Determine author and created_at from content or set defaults
    from datetime import datetime
    author = content.get('author') if isinstance(content, dict) else None
    created_at = content.get('created_at') if isinstance(content, dict) else None

    # Perform insert, retry creating table on OperationalError if necessary
    try:
        conn = _get_conn()
        c = conn.cursor()
        c.execute('INSERT INTO posts (thumbnail, title, content, author, created_at) VALUES (?, ?, ?, ?, ?)',
                  (rel_thumbnail_path, title, rel_mdx_path, author, created_at))
        conn.commit()
        rowid = c.lastrowid
        conn.close()
    except sqlite3.OperationalError:
        # Table might be missing or missing columns; try to create/alter and retry once
        create_posts_table()
        conn = _get_conn()
        c = conn.cursor()
        c.execute('INSERT INTO posts (thumbnail, title, content, author, created_at) VALUES (?, ?, ?, ?, ?)',
                  (rel_thumbnail_path, title, rel_mdx_path, author, created_at))
        conn.commit()
        rowid = c.lastrowid
        conn.close()
    return int(rowid) if rowid is not None else -1


def get_posts() -> List[Tuple[int, str, str, str, Optional[str], Optional[str]]]:
    conn = _get_conn()
    c = conn.cursor()
    c.execute('SELECT id, thumbnail, title, content, author, created_at FROM posts')
    posts = c.fetchall()
    conn.close()
    return posts


def get_post(post_id: int) -> Optional[Tuple[int, str, str, str, Optional[str], Optional[str]]]:
    conn = _get_conn()
    c = conn.cursor()
    c.execute('SELECT id, thumbnail, title, content, author, created_at FROM posts WHERE id = ?', (post_id,))
    post = c.fetchone()
    conn.close()
    return post


def update_post(post_id: int, title: str, content: Optional[Dict]) -> None:
    import os
    conn = _get_conn()
    c = conn.cursor()
    if content:
        mdx_content = content.get('mdx')
        thumbnail_bytes = content.get('thumbnail_bytes')
        thumbnail_ext = content.get('thumbnail_ext')
        c.execute('SELECT content, thumbnail FROM posts WHERE id = ?', (post_id,))
        row = c.fetchone()
        if row:
            old_content_path, old_thumbnail_path = row
            if mdx_content:
                with open(os.path.join(os.path.dirname(__file__), old_content_path), 'w', encoding='utf-8') as f:
                    f.write(mdx_content)
            if thumbnail_bytes and thumbnail_ext:
                thumbnail_path = os.path.join(os.path.dirname(__file__), old_thumbnail_path)
                with open(thumbnail_path, 'wb') as f:
                    f.write(thumbnail_bytes)
        c.execute('UPDATE posts SET title = ? WHERE id = ?', (title, post_id))
    else:
        c.execute('UPDATE posts SET title = ? WHERE id = ?', (title, post_id))
    conn.commit()
    conn.close()


def delete_post(post_id: int) -> bool:
    import os
    conn = _get_conn()
    c = conn.cursor()
    c.execute('SELECT content, thumbnail FROM posts WHERE id = ?', (post_id,))
    row = c.fetchone()
    if row:
        content_path, thumbnail_path = row
        try:
            os.remove(os.path.join(os.path.dirname(__file__), content_path))
            os.remove(os.path.join(os.path.dirname(__file__), thumbnail_path))
        except Exception:
            pass
    c.execute('DELETE FROM posts WHERE id = ?', (post_id,))
    conn.commit()
    affected = c.rowcount
    conn.close()
    return affected > 0