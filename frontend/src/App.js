import logo from './logo.svg';
import './App.css';
import AddItem from './AddItem';
import ModifyItems from './ModifyItems';
import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register.js';

function App() {
  const [items, setItems] = useState([]);

  const fetchItems = async (e) => {
      try {
          const response = await fetch('http://localhost:5000/items', {
              method: 'GET',
              credentials: 'include',
          });
          const data = await response.json();
          setItems(data);
      } catch (error) {
          console.error('Error fetching items:', error);
      }
  }

  useEffect(() => {
    fetchItems();
    }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" exact element={<Login />} />
            <Route path="/register" exact element={<Register />} />
            <Route 
              path="/home" 
              element={
                <>
                  <AddItem fetchItems={fetchItems} />
                  <ModifyItems items={items} fetchItems={fetchItems} />
                </>
              } 
            />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
