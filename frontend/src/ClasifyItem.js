import react, { useState, useEffect } from 'react';
import './ClasifyItems.css';

function ClasifyItem( {fetchItems} ) {
    const [showImageInput, setShowImageInput] = useState(false);
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [errorPresent, setErrorPresent] = useState(false);
    const [itemData, setItemData] = useState({
        category: '',
        name: '',
        location: '',
        purchase_date: '',
        expiration_date: '',
        warranty_until: '',
        notes: '',
        image: null,
        preview_url: null,
    })
    const [categoryPopupVisible, setCategoryPopupVisible] = useState(false);
    const [formPopupVisible, setFormPopupVisible] = useState(false);
    const [formNoCategoryVisibility, setFormNoCategoryVisibility] = useState(false);
    
    const handleAddImageClick = () => {
        setShowImageInput(true);
        setError(null);
        setErrorPresent(false);
        setCategoryPopupVisible(false);
        setFormPopupVisible(false);
        setItemData(prev => ({
            ...prev,
            category: '',
            image: null,
            preview_url: null,
        }));
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    }

    const handleSendImageClick = async (e) => {
        e.preventDefault();

        if (!image) {
            alert('Please select an image first.');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('http://localhost:5000/scan_image', {
                method: 'POST',
                body: formData, 
                credentials: 'include',
            })

            const data = await response.json();
            if (response.ok) {
                console.log('Image processed successfully:', data);

                setItemData(prev => ({
                    ...prev,
                    category: data.label.trim().toLowerCase(),
                    image: image, 
                    preview_url: `http://localhost:5000/${data.img_url}`
                }))
                setError(null);
                setErrorPresent(false);
                setImage(null);
                setCategoryPopupVisible(true);
                
            } else {
                console.error('Error processing image:', data);
                setError(data.error || 'An error occurred while processing the image.');
                setErrorPresent(true);
                setImage(null);
            }

        } catch(error) {
            console.error('Error sending image:', error)
            setError('An error occurred while sending the image.');
            setErrorPresent(true);
            setImage(null);
        }
        setCategoryPopupVisible(true);
    }

    useEffect(() => {
        console.log('Updated category:', itemData.category);
        console.log('Updated image:', itemData.image); }, [itemData]);
    
    const handleYesClick = () => {
        setFormPopupVisible(true);
        setCategoryPopupVisible(false);
    }

    const handleNoClick = () => {
        setItemData(prev => ({
            ...prev,
            category: '' 
    }));
        setFormNoCategoryVisibility(true);
        setCategoryPopupVisible(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemData(prev => ({
        ...prev,
        [name]: value,
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

        await fetchItems();

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

        setFormPopupVisible(false);
        setShowImageInput(false);

        } catch (error) {
        console.error('Error adding item:', error);
        }
    }

    const closeAllPopups = () => {
        setShowImageInput(false);
        setCategoryPopupVisible(false);
        setFormPopupVisible(false);
        setFormNoCategoryVisibility(false);
        setError(null);
        setErrorPresent(false);
    };



    return (
        <>
        <button onClick={handleAddImageClick}>Scan image</button>
        {showImageInput && (
            <div className="popup-overlay">
            <div className="add-item-popup">
                <button className="close-btn" onClick={closeAllPopups}>×</button>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleSendImageClick}>See result</button>
                <p>{error}</p>
            </div>
            </div>
        )}

        {categoryPopupVisible && !errorPresent && (
            <>
                <div className='popup-overlay'>
                    <div className='add-item-popup'>
                        <button className="close-btn" onClick={closeAllPopups}>×</button>
                        <p>Category: {itemData.category}</p>
                        <p>Is the category correct?</p>
                        <button onClick={handleYesClick}>Yes</button>
                        <button onClick={handleNoClick}>No</button>
                    </div>
                </div>
            </>
        )}

        {formPopupVisible && !errorPresent && (
            <div className='popup-overlay'>
                <form onSubmit={handleSubmit} className='add-item-popup'>
                    <button className="close-btn" onClick={closeAllPopups}>×</button>
                    <p>Category: {itemData.category}</p>

                    {(itemData.category) && (
                    <>
                        <label>
                        Name:
                        <input
                            name="name"
                            value={itemData.name}
                            onChange={handleChange}
                            required
                        />
                        </label>

                        <label>
                        Location:
                        <input
                            name="location"
                            value={itemData.location}
                            onChange={handleChange}
                        />
                        </label>

                        <label>
                        Purchase Date:
                        <input
                            type="date"
                            name="purchase_date"
                            value={itemData.purchase_date}
                            onChange={handleChange}
                        />
                        </label>
                    </>
                    )}

                    {(itemData.category === 'food' || itemData.category === 'medicines' || itemData.category === 'other') && (
                    <label>
                        Expiration Date:
                        <input
                        type="date"
                        name="expiration_date"
                        value={itemData.expiration_date}
                        onChange={handleChange}
                        />
                    </label>
                    )}

                    {(itemData.category === 'electronics' || itemData.category === 'tools' || itemData.category === 'other') && (
                    <label>
                        Warranty Until:
                        <input
                        type="date"
                        name="warranty_until"
                        value={itemData.warranty_until}
                        onChange={handleChange}
                        />
                    </label>
                    )}

                    {(itemData.category) && (
                    <>
                        <label>
                        Notes:
                        <textarea
                            name="notes"
                            value={itemData.notes}
                            onChange={handleChange}
                        />
                        </label>

                        {itemData.preview_url && (
                        <>
                            <p>Image:</p>
                            <img
                            src={itemData.preview_url}
                            alt="item"
                            width="100"
                            style={{ marginBottom: '10px' }}
                            />
                        </>
                        )}

                        <button type="submit">Save</button>
                    </>
                    )}
                </form>
        </div>
        )}

        {formNoCategoryVisibility && (
            <div className='popup-overlay'>
                <form onSubmit={handleSubmit} className='add-item-popup'>
                    <button className="close-btn" onClick={closeAllPopups}>×</button>
                    <label>
                    Choose Category:
                    <select
                        name="category"
                        value={itemData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Select --</option>
                        <option value="food">Food</option>
                        <option value="medicines">Medicines</option>
                        <option value="clothing">Clothing</option>
                        <option value="tools">Tools</option>
                        <option value="electronics">Electronics</option>
                        <option value="other">Other</option>
                    </select>
                    </label>

                    {itemData.category && (
                    <>
                        <label>
                        Name:
                        <input
                            name="name"
                            value={itemData.name}
                            onChange={handleChange}
                            required
                        />
                        </label>

                        <label>
                        Location:
                        <input
                            name="location"
                            value={itemData.location}
                            onChange={handleChange}
                        />
                        </label>

                        <label>
                        Purchase Date:
                        <input
                            type="date"
                            name="purchase_date"
                            value={itemData.purchase_date}
                            onChange={handleChange}
                        />
                        </label>
                    </>
                    )}

                    {(itemData.category === 'food' || itemData.category === 'medicines' || itemData.category === 'other') && (
                    <label>
                        Expiration Date:
                        <input
                        type="date"
                        name="expiration_date"
                        value={itemData.expiration_date}
                        onChange={handleChange}
                        />
                    </label>
                    )}

                    {(itemData.category === 'electronics' || itemData.category === 'tools' || itemData.category === 'other') && (
                    <label>
                        Warranty Until:
                        <input
                        type="date"
                        name="warranty_until"
                        value={itemData.warranty_until}
                        onChange={handleChange}
                        />
                    </label>
                    )}

                    {itemData.category && (
                    <>
                        <label>
                        Notes:
                        <textarea
                            name="notes"
                            value={itemData.notes}
                            onChange={handleChange}
                        />
                        </label>

                        {itemData.preview_url && (
                        <>
                            <p>Image:</p>
                            <img
                            src={itemData.preview_url}
                            alt="item"
                            width="100"
                            style={{ marginBottom: '10px' }}
                            />
                        </>
                        )}

                        <button type="submit">Save</button>
                    </>
                    )}
                </form>
        </div>
        )}

        </>
    );
}

export default ClasifyItem;