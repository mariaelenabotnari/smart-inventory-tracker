import React, { useState, useRef } from 'react';
import './AddItem.css';
import ClasifyItem from './ClasifyItem.js';

function AddItem({ fetchItems }) {
  const [itemData, setItemData] = useState({
    category: '',
    name: '',
    location: '',
    purchase_date: '',
    expiration_date: '',
    warranty_until: '',
    notes: '',
    image: null,
  });

  const [showPopup, setShowPopup] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setItemData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setItemData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(itemData).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await fetch('http://localhost:5000/item', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }

    setItemData({
      category: '',
      name: '',
      location: '',
      purchase_date: '',
      expiration_date: '',
      warranty_until: '',
      notes: '',
      image: null,
    });

    setShowPopup(false);
  };

  const { category } = itemData;

  return (
    <>
      <button className="add-item-button" onClick={() => setShowPopup(true)}>
        Add Item
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="add-item-popup">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <form className="add-item-form" onSubmit={handleSubmit}>
              <label>
                Category:
                <select name="category" value={category} onChange={handleChange} required>
                  <option value="">Choose Category</option>
                  <option value="food">Food</option>
                  <option value="medicines">Medicines</option>
                  <option value="clothing">Clothing</option>
                  <option value="tools">Tools</option>
                  <option value="electronics">Electronics</option>
                  <option value="other">Other</option>
                </select>
              </label>

              {category && (
                <>
                  <label>
                    Name:
                    <input name="name" onChange={handleChange} value={itemData.name} required />
                  </label>
                  <label>
                    Location:
                    <input name="location" onChange={handleChange} value={itemData.location} />
                  </label>
                  <label>
                    Purchase Date:
                    <input type="date" name="purchase_date" onChange={handleChange} value={itemData.purchase_date} />
                  </label>
                </>
              )}

              {(category === 'food' || category === 'medicines' || category === 'other') && (
                <label>
                  Expiration Date:
                  <input type="date" name="expiration_date" onChange={handleChange} value={itemData.expiration_date} />
                </label>
              )}

              {(category === 'electronics' || category === 'tools' || category === 'other') && (
                <label>
                  Warranty Until:
                  <input type="date" name="warranty_until" onChange={handleChange} value={itemData.warranty_until} />
                </label>
              )}

              {category && (
                <>
                  <label>
                    Notes:
                    <textarea name="notes" onChange={handleChange} value={itemData.notes} />
                  </label>
                  <label>
                    Upload Image:
                    <input type="file" name="image" onChange={handleFileChange} ref={fileInputRef} />
                  </label>
                  {itemData.image && (
                    <button
                      type="button"
                      className="remove-img-btn"
                      onClick={() => {
                        setItemData((prev) => ({ ...prev, image: null }));
                        fileInputRef.current.value = null;
                      }}>
                      Remove Image
                    </button>
                  )}
                  <button type="submit" className="submit-btn">Add Item</button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
      <ClasifyItem fetchItems={fetchItems} />
    </>
  );
}

export default AddItem;
