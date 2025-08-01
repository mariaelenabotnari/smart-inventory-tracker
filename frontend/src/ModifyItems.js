import React, { useState } from 'react';
import './ModifyItems.css';

function ModifyItems({ items, fetchItems }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatedItem, setUpdatedItem] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [file, setFile] = useState(null);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const openEditModal = (item) => {
    const cleanedItem = Object.fromEntries(
      Object.entries(item).map(([key, value]) => {
        if (typeof value === 'string' && value.includes('GMT')) {
          const formatted = new Date(value).toISOString().split('T')[0];
          return [key, formatted];
        }
        return [key, value === 'null' ? null : value];
      })
    );
    setUpdatedItem(cleanedItem);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setUpdatedItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(updatedItem).forEach(([key, value]) => {
      if (key !== 'image_url') {
        const cleanedValue = (value === '' || value === 'null') ? null : value;
        if (cleanedValue !== null) {
          formData.append(key, cleanedValue);
        }
        if (file) {
          formData.append('image', file); 
}
      }
    });

    try {
      await fetch(`http://localhost:5000/item/${updatedItem.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      setShowEditModal(false);
      fetchItems();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`http://localhost:5000/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const groupedByCategory = items.reduce((acc, item) => {
    const category = item.category?.trim().toLowerCase() || 'uncategorized';
    acc[category] = acc[category] || [];
    acc[category].push(item);
    return acc;
  }, {});

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUpdatedItem((prev) => ({
      ...prev,
      image: e.target.files[0],
    }))
  }

  return (
    <div className="items-container">
      {Object.entries(groupedByCategory).map(([category, itemsInCat]) => (
        <div className="category-group" key={category}>
          <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
          <div className="item-cards">
            {itemsInCat.map((item) => (
              <div className="item-card" key={item.id}>
                <h4>{item.name}</h4>
                <p>{item.notes}</p>
                {item.image_url != null && item.image_url !== '' && (
                  <img src={`http://localhost:5000/${item.image_url}`} alt={item.name} width="100" />
                )}
                <div>
                  <button onClick={() => openDetailsModal(item)}>See More</button>
                  <button onClick={() => openEditModal(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showEditModal && (
        <div className="modal">
          <form className="modal-content" onSubmit={handleUpdate}>
            <h3>Edit Item</h3>
            <label>
              Name:
              <input name="name" value={updatedItem.name || ''} onChange={handleEditChange} />
            </label>
            {updatedItem.location != null && (
              <label>
                Location:
                <input name="location" value={updatedItem.location} onChange={handleEditChange} />
              </label>
            )}
            {updatedItem.purchase_date != null && (
              <label>
                Purchase Date:
                <input type="date" name="purchase_date" value={updatedItem.purchase_date} onChange={handleEditChange} />
              </label>
            )}
            {updatedItem.expiration_date != null && (
              <label>
                Expiration Date:
                <input type="date" name="expiration_date" value={updatedItem.expiration_date} onChange={handleEditChange} />
              </label>
            )}
            {updatedItem.warranty_until != null && (
              <label>
                Warranty Until:
                <input type="date" name="warranty_until" value={updatedItem.warranty_until} onChange={handleEditChange} />
              </label>
            )}
            {updatedItem.notes != null && (
              <label>
                Notes:
                <textarea name="notes" value={updatedItem.notes} onChange={handleEditChange} />
              </label>
            )}
            {updatedItem.image_url && (
              <div>
                <p>Current Image:</p>
                  <img
                    src={`http://localhost:5000/${updatedItem.image_url}`}
                    alt="item"
                    width="100"
                    style={{ marginBottom: '10px' }}
                  />
                  <p>Choose new image:</p>
                  <input type="file" name="image" onChange={handleFileChange} />
              </div>
            )}
            <div className="modal-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showDetailsModal && selectedItem && (
        <div className="modal">
          <div className="modal-content details-content">
            <h3>{selectedItem.name}</h3>
            {selectedItem.image_url && <img src={`http://localhost:5000/${selectedItem.image_url}`} alt={selectedItem.name} width="150" />}
            {selectedItem.notes && <p><strong>Notes:</strong> {selectedItem.notes}</p>}
            {selectedItem.location && <p><strong>Location:</strong> {selectedItem.location}</p>}
            {selectedItem.purchase_date && <p><strong>Purchase Date:</strong> {formatDateForDisplay(selectedItem.purchase_date)}</p>}
            {selectedItem.expiration_date && <p><strong>Expiration Date:</strong> {formatDateForDisplay(selectedItem.expiration_date)}</p>}
            {selectedItem.warranty_until && <p><strong>Warranty Until:</strong> {formatDateForDisplay(selectedItem.warranty_until)}</p>}
            <div className="modal-actions">
              <button onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModifyItems;
