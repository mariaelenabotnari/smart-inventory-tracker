import os
import uuid
from flask import Flask, request, jsonify, Blueprint
from flask_login import current_user, login_required
from models.item import db, Item
from werkzeug.utils import secure_filename

items_bp = Blueprint('items_bp', __name__)

UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@items_bp.route('/items', methods=['GET'])   # send data to frontend server
@login_required
def send_items():
    user_id = current_user.id
    items = Item.query.filter_by(user_id=user_id).all()
    items_list = [
        {
            "id":item.id,
            "user_id":item.user_id,
            "category":item.category,
            "name":item.name,
            "location":item.location,
            "purchase_date":item.purchase_date,
            "expiration_date":item.expiration_date,
            "warranty_until":item.warranty_until,
            "notes":item.notes,
            "image_url":item.image_url

        } for item in items
    ]
    return jsonify(items_list)

@items_bp.route('/item', methods=['POST'])  # get data from frontend server
@login_required
def receive_item():
    item_category = request.form.get('category')
    item_name = request.form.get('name')
    item_location = request.form.get('location')
    item_purchase_date = request.form.get('purchase_date')
    item_expiration_date = request.form.get('expiration_date')
    item_warranty_until = request.form.get('warranty_until')
    item_notes = request.form.get('notes')

    # Image handling
    item_image_url = None
    image = request.files.get('image')

    if image and allowed_file(image.filename):
        # Ensure the upload folder exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # Create a unique filename
        original_filename = secure_filename(image.filename)
        file_ext = os.path.splitext(original_filename)[1]
        unique_filename = str(uuid.uuid4()) + file_ext
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

        # Save file
        image.save(filepath)

        # Store WEB ACCESSIBLE PATH
        item_image_url = f"static/uploads/{unique_filename}"
        print(item_image_url)

    if not all([item_category, item_name]):
        return jsonify({"error" : "Add a category and name"}), 400

    user_id = current_user.id

    new_item = Item(category=item_category, name=item_name, location=item_location,
                    purchase_date=item_purchase_date, expiration_date=item_expiration_date,
                    warranty_until=item_warranty_until, notes=item_notes, image_url=item_image_url,
                    user_id=user_id)
    print(item_category, item_name, item_location, item_purchase_date,
          item_expiration_date, item_warranty_until, item_notes, item_image_url)

    db.session.add(new_item)
    db.session.commit()

    return jsonify({"message" : "Data sent successfully"}, {"image_url":item_image_url}), 201

@items_bp.route('/item/<int:item_id>', methods=['PUT'])
@login_required
def change_item(item_id):
    try:
        item_to_update = Item.query.get(item_id)

        if not item_to_update:
            return jsonify({"error" : "Item not found"}), 404

        item_to_update.category = request.form.get("category", item_to_update.category)
        item_to_update.name = request.form.get("name", item_to_update.name)
        item_to_update.location = request.form.get("location", item_to_update.location)
        item_to_update.purchase_date = request.form.get("purchase_date", item_to_update.purchase_date)
        item_to_update.expiration_date = request.form.get("expiration_date", item_to_update.expiration_date)
        item_to_update.warranty_until = request.form.get("warranty_until", item_to_update.warranty_until)
        item_to_update.notes = request.form.get("notes", item_to_update.notes)

        image = request.files.get('image')
        if image and allowed_file(image.filename):
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            original_filename = secure_filename(image.filename)
            file_ext = os.path.splitext(original_filename)[1]
            unique_filename = str(uuid.uuid4()) + file_ext
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            image.save(filepath)
            # Update the image URL in the database
            item_to_update.image_url = f"static/uploads/{unique_filename}"

        db.session.commit()

        print(f"Updated item {item_id}: {item_to_update}")

        return jsonify({
            "message":"Item updated successfully!",
            "updated_item" : {"category":item_to_update.category, "name":item_to_update.name,
                              "location":item_to_update.location,
                              "purchase_date":item_to_update.purchase_date,
                              "expiration_date": item_to_update.expiration_date,
                              "warranty_until": item_to_update.warranty_until,
                              "notes":item_to_update.notes, "image_url":item_to_update.image_url}})

    except Exception as e:
        return jsonify({"error":str(e)}), 500


@items_bp.route('/item/<int:item_id>', methods=['DELETE'])
@login_required
def delete_item(item_id):
    item_to_delete = Item.query.get(item_id)

    if not item_to_delete:
        return jsonify({"error":"Item not found"}), 404

    db.session.delete(item_to_delete)
    db.session.commit()

    return jsonify({"message":"Item deleted successfully"}), 200