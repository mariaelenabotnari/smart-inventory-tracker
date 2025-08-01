import os
import pickle
from img2vec_pytorch import Img2Vec
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

img2vec = Img2Vec()

data_dir = 'C:/Users/maria/Documents/smart-inventory-tracker/backend/item_classifier/data/items_dataset'
train_dir = os.path.join(data_dir, 'train')
val_dir = os.path.join(data_dir, 'val')

data = {}
for j, dir_ in enumerate([train_dir, val_dir]):
    features = []
    labels = []
    for category in os.listdir(dir_):
        category_dir = os.path.join(dir_, category)
        for img_path in os.listdir(category_dir):
            img_path_ = os.path.join(category_dir, img_path)

            try:
                img = Image.open(img_path_)

                # Convert RGBA to RGB if needed
                if img.mode == 'RGBA':
                    img = img.convert('RGB')

                img_features = img2vec.get_vec(img)
                features.append(img_features)
                labels.append(category)

            except Exception as e:
                print(f"Skipping {img_path_} due to error: {e}")
                continue

    data_key = 'training_data' if j == 0 else 'validation_data'
    labels_key = 'training_labels' if j == 0 else 'validation_labels'
    data[data_key] = features
    data[labels_key] = labels

model = RandomForestClassifier()
model.fit(data['training_data'], data['training_labels'])

y_pred = model.predict(data['validation_data'])
score = accuracy_score(y_pred, data['validation_labels'])
print(y_pred, score)

# Save the model
with open('./model.p', 'wb') as f:
    pickle.dump(model, f)
    f.close()
