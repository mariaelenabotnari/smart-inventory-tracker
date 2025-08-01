from flask import Flask
from flask_cors import CORS
from models.user import db  # Import db from models
from routes.auth_routes import auth_bp
from routes.item_routes import items_bp
from routes.item_classification_routes import classification_bp
from flask_login import LoginManager
from models.user import User

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:maria2004@localhost/smart_inventory_tracker'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = "secret_key"

UPLOAD_FOLDER = "static/uploads"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize db
db.init_app(app)

# Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'routes.auth_routes'

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(items_bp)
app.register_blueprint(classification_bp)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)