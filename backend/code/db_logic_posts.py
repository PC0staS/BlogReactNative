import sqlite3


def create_db():
    conn = sqlite3.connect('blog.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thumbnail TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def create_post(title, content):
    import os
    import uuid
    from datetime import datetime
    # Crear carpeta de posts si no existe
    posts_dir = os.path.join(os.path.dirname(__file__), '../posts')
    os.makedirs(posts_dir, exist_ok=True)

    # content debe ser un dict: {'mdx': contenido_mdx, 'thumbnail_bytes': bytes, 'thumbnail_ext': '.jpg'/'png'}
    mdx_content = content['mdx']
    thumbnail_bytes = content['thumbnail_bytes']
    thumbnail_ext = content['thumbnail_ext']

    # Generar nombres únicos
    post_id = str(uuid.uuid4())
    mdx_filename = f"{post_id}.mdx"
    thumbnail_filename = f"{post_id}{thumbnail_ext}"

    mdx_path = os.path.join(posts_dir, mdx_filename)
    thumbnail_path = os.path.join(posts_dir, thumbnail_filename)

    # Guardar archivos
    with open(mdx_path, 'w', encoding='utf-8') as f:
        f.write(mdx_content)
    with open(thumbnail_path, 'wb') as f:
        f.write(thumbnail_bytes)

    # Guardar paths relativos en la base de datos
    rel_mdx_path = os.path.relpath(mdx_path, os.path.dirname(__file__))
    rel_thumbnail_path = os.path.relpath(thumbnail_path, os.path.dirname(__file__))

    conn = sqlite3.connect('blog.db')
    c = conn.cursor()
    c.execute('INSERT INTO posts (thumbnail, title, content) VALUES (?, ?, ?)',
              (rel_thumbnail_path, title, rel_mdx_path))
    conn.commit()
    conn.close()

def get_posts():
    conn = sqlite3.connect('blog.db')
    c = conn.cursor()
    c.execute('SELECT id, thumbnail, title, content FROM posts')
    posts = c.fetchall()
    conn.close()
    return posts

def get_post(post_id):
    conn = sqlite3.connect('blog.db')
    c = conn.cursor()
    c.execute('SELECT id, thumbnail, title, content FROM posts WHERE id = ?', (post_id,))
    post = c.fetchone()
    conn.close()
    return post

def update_post(post_id, title, content):
    import os
    # content puede ser None si no se actualiza
    conn = sqlite3.connect('blog.db')
    c = conn.cursor()
    if content:
        # Actualizar archivos
        mdx_content = content.get('mdx')
        thumbnail_bytes = content.get('thumbnail_bytes')
        thumbnail_ext = content.get('thumbnail_ext')
        c.execute('SELECT content, thumbnail FROM posts WHERE id = ?', (post_id,))
        old_content_path, old_thumbnail_path = c.fetchone()
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

def delete_post(post_id):
    import os
    conn = sqlite3.connect('blog.db')
    c = conn.cursor()
    c.execute('SELECT content, thumbnail FROM posts WHERE id = ?', (post_id,))
    row = c.fetchone()
    if row:
        content_path, thumbnail_path = row
        # Eliminar archivos
        try:
            os.remove(os.path.join(os.path.dirname(__file__), content_path))
            os.remove(os.path.join(os.path.dirname(__file__), thumbnail_path))
        except Exception:
            pass
    c.execute('DELETE FROM posts WHERE id = ?', (post_id,))
    conn.commit()
    conn.close()