from flask import Blueprint, request, session, redirect, url_for, render_template, jsonify
from models.user import User, db
from email_validator import validate_email, EmailNotValidError
from flask_login import login_user

auth_bp = Blueprint('auth_bp', __name__)

def validate_email_address(email):
    try:
        # Validate and get info
        v = validate_email(email)
        # Replace with normalized form
        email = v["email"]
        return True, email
    except EmailNotValidError as e:
        return False, str(e)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error" : "Invalid credentials"}), 401

    session["user_id"] = user.id  # Store user id in session
    login_user(user)
    return jsonify({"message" : "Login successful"}), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    # Validate that all fields exist
    if not all([username, email, password]):
        return jsonify({"message" : "All fields are requiered"}), 400

    # Check if email exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error" : "Email already registered"}), 400

    # Check if username exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error" : "Username already taken"}), 400

    if len(password) < 8:
        return jsonify({"error":"Password must be at least 8 characters long"}), 400

    is_valid, email_or_error = validate_email_address(email)
    if not is_valid:
        return jsonify({'error': email_or_error}), 400

    new_user = User(email=email, username=username)
    new_user.set_password(password)

    login_user(new_user)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message" : "Registration successful"}), 201

