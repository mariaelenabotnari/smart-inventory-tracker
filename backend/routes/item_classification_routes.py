import os
import uuid
from flask import request, jsonify, Blueprint
from werkzeug.utils import secure_filename
import pickle
from img2vec_pytorch import Img2Vec
from PIL import Image

classification_bp = Blueprint('classification_bp', __name__)

UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@classification_bp.route("/scan_image", methods=['POST'])
def classify_image():
    global predicted_label
    image = request.files.get('image')
    image_url = None
    predicted_label = None

    if image and allowed_file(image.filename):
        original_filename = secure_filename(image.filename)
        file_extension = os.path.splitext(original_filename)[1]
        unique_filename = str(uuid.uuid4()) + file_extension
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        image.save(filepath)
        image_url = f"static/uploads/{unique_filename}"
        print(image_url)

        with open('C:/Users/maria/Documents/smart-inventory-tracker/backend/item_classifier/model.p', 'rb') as f:
            model = pickle.load(f)
        img2vec = Img2Vec()

        try:
            img = Image.open(filepath)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img_features = img2vec.get_vec(img)
            img_features = img_features.reshape(1, -1)
            predicted_label = model.predict(img_features)[0]
            print(f"Predicted Label: {predicted_label}")

        except Exception as e:
            print(f"Error processing image: {e}")
            return jsonify({"message": "Error processing image.", "error": str(e)}), 500

    else:
        return jsonify({"error": "Invalid or missing image file"}), 400

    return jsonify({"label":predicted_label, "img_url":image_url}), 200

