import pickle
from img2vec_pytorch import Img2Vec
from PIL import Image

# 1. Load the trained model
with open('./model.p', 'rb') as f:
    model = pickle.load(f)

# 2. Initialize Img2Vec
img2vec = Img2Vec()

# 3. Define the path to your test image
test_image_path = "C:/Users/maria/Documents/smart-inventory-tracker/backend/item_classifier/24271_pictures_product_visual_1.png"

# 4. Preprocess the image and extract features
try:
    img = Image.open(test_image_path)

    # Convert to RGB if needed (e.g., RGBA or grayscale)
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Get image vector (embedding)
    img_features = img2vec.get_vec(img)

    # Reshape to (1, n_features) for prediction
    img_features = img_features.reshape(1, -1)

    # 5. Predict the label
    predicted_label = model.predict(img_features)[0]
    print(f"Predicted Label: {predicted_label}")

except Exception as e:
    print(f"Error processing {test_image_path}: {e}")