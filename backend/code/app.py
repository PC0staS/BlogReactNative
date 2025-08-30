import os
from datetime import timedelta
from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS  # type: ignore
from flask_jwt_extended import ( # type: ignore
	JWTManager, create_access_token, jwt_required, get_jwt_identity
)  # type: ignore
import base64
import json
from dotenv import load_dotenv  # type: ignore

from db_logic_users import (
	clear_users,
	create_table,
	add_user,
	verify_credentials,
	get_user as db_get_user,
	check_user_exists
)

from db_logic_posts import (
	create_post as db_create_post,
	get_post as db_get_post,
	get_posts as db_get_posts,
	update_post as db_update_post,
	delete_post as db_delete_post
)

load_dotenv()  # load env vars from .env if present
app = Flask(__name__)
# Config JWT desde .env
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret-change-me")
_jwt_expires_minutes = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "480"))  # 8h por defecto
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=_jwt_expires_minutes)

# Allow Authorization header and known dev origins so browsers/emulators can send the token
CORS(app, resources={r"/api/*": {"origins": [
	"http://localhost:8081",
	"http://10.0.2.2",
	"http://127.0.0.1",
	"http://192.168.1.57"
]}}, expose_headers=["Authorization"], allow_headers=["Content-Type", "Authorization"], supports_credentials=True)
jwt = JWTManager(app)

# JWT error handlers to return JSON
@jwt.unauthorized_loader
def _unauthorized_loader(msg):
	return jsonify({"error": msg or "Missing Authorization Header"}), 401

@jwt.invalid_token_loader
def _invalid_token_loader(msg):
	return jsonify({"error": msg or "Invalid token"}), 401

@jwt.expired_token_loader
def _expired_token_loader(header, payload):
	return jsonify({"error": "Token has expired"}), 401


# Initialize DB tables at startup (safe, idempotent)
create_table()

@app.get("/api/health")
def health():
	return jsonify({"status": "ok"})

@app.post("/api/auth/signup")
def signup():
	data = request.get_json(silent=True) or {}
	name = (data.get("name") or "").strip()
	email = (data.get("email") or "").strip().lower()
	password = data.get("password") or ""
	if not name or not email or not password:
		return jsonify({"error": "Missing name, email or password"}), 400
	# Prevent duplicate emails with a clear error message
	if check_user_exists(email):
		return jsonify({"error": "Email already registered"}), 409
	try:
		user_id = add_user(name, email, password)
		if user_id < 0:
			return jsonify({"error": "Failed to create user"}), 500
		user = db_get_user(user_id)
		return jsonify({"user": user}), 201
	except Exception as e:
		# likely duplicate email or DB error
		return jsonify({"error": str(e)}), 400

@app.post("/api/auth/login")
def login():
	data = request.get_json(silent=True) or {}
	email = (data.get("email") or "").strip().lower()
	password = data.get("password") or ""
	if not email or not password:
		return jsonify({"error": "Missing email or password"}), 400
	user = verify_credentials(email, password)
	if not user:
		return jsonify({"error": "Invalid credentials"}), 401
	access_token = create_access_token(identity=str(user["id"]))
	return jsonify({"user": user, "token": access_token}), 200

@app.get("/api/users/<int:user_id>")
@jwt_required()
def get_user(user_id: int):
	current_user_id = get_jwt_identity()
	# Simple rule: only allow fetching your own profile
	if int(current_user_id) != int(user_id):
		return jsonify({"error": "Forbidden"}), 403
	user = db_get_user(user_id)
	if not user:
		return jsonify({"error": "User not found"}), 404
	return jsonify({"user": user})

@app.delete("/api/users/<int:user_id>")
@jwt_required()
def delete_user(user_id: int):
	current_user_id = get_jwt_identity()
	# Simple rule: only allow deleting your own profile
	if int(current_user_id) != int(user_id):
		return jsonify({"error": "Forbidden"}), 403
	if not db_get_user(user_id):
		return jsonify({"error": "User not found"}), 404
	if delete_user(user_id):
		return jsonify({"message": "User deleted"}), 200
	return jsonify({"error": "Failed to delete user"}), 500

@app.delete("/api/clear_db")
def clear_db():
	clear_users()
	return jsonify({"message": "All users deleted"}), 200

@app.get("/api/auth/check")
@jwt_required()
def auth_check():
	"""Return the current user for a valid token."""
	try:
		current_user_id = get_jwt_identity()
		if current_user_id is None:
			return jsonify({"error": "Missing identity in token"}), 401

		# db_get_user expects an integer id; try to cast when possible
		try:
			uid = int(current_user_id)
		except Exception:
			uid = current_user_id

		user = db_get_user(uid)
		if not user:
			return jsonify({"error": "User not found"}), 404
		return jsonify({"user": user}), 200
	except Exception as e:
		app.logger.exception("Error in auth_check")
		return jsonify({"error": "Internal server error", "detail": str(e)}), 500

@app.get('/api/debug/auth-header')
def debug_auth_header():
	# Return the Authorization header the server received (for debugging)
	auth = request.headers.get('Authorization')
	return jsonify({"authorization": auth}), 200

@app.get('/api/debug/decode-token')
def debug_decode_token():
	"""Decode JWT payload without verifying signature (dev-only)."""
	auth = request.headers.get('Authorization')
	if not auth:
		return jsonify({"error": "Missing Authorization header"}), 400
	parts = auth.split()
	if len(parts) != 2 or parts[0].lower() != 'bearer':
		return jsonify({"error": "Bad Authorization header format"}), 400
	token = parts[1]
	try:
		payload_b64 = token.split('.')[1]
		# pad base64
		padding = '=' * (-len(payload_b64) % 4)
		payload_bytes = base64.urlsafe_b64decode(payload_b64 + padding)
		payload = json.loads(payload_bytes)
		return jsonify({"payload": payload}), 200
	except Exception as e:
		return jsonify({"error": "Failed to decode token payload", "detail": str(e)}), 400


@app.get("/api/posts")
def get_posts():
	posts = db_get_posts()
	return jsonify({"posts": posts}), 200

@app.get("/api/posts/<int:post_id>")
def get_post(post_id: int):
	post = db_get_post(post_id)
	if not post:
		return jsonify({"error": "Post not found"}), 404
	return jsonify({"post": post}), 200

@app.post("/api/posts")
def create_post():
	data = request.get_json(silent=True) or {}
	title = (data.get("title") or "").strip()
	content = (data.get("content") or "").strip()
	if not title or not content:
		return jsonify({"error": "Missing title or content"}), 400
	post_id = db_create_post(title, content)
	return jsonify({"post_id": post_id}), 201

@app.delete("/api/posts/<int:post_id>")
def delete_post(post_id: int):
	if db_delete_post(post_id):
		return jsonify({"message": "Post deleted"}), 200
	return jsonify({"error": "Failed to delete post"}), 500

if __name__ == "__main__":
	port = int(os.environ.get("PORT", "3000"))
	app.run(host="0.0.0.0", port=port)
