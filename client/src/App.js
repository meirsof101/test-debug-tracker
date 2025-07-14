import React, { useState } from 'react';
import './index.css';
import UserList from './components/UserList';
import UserForm from './components/UserForm';

function App() {
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = (formData) => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleUserSubmit = async (formData) => {
    // Clear previous messages and errors
    setMessage('');
    setErrors({});
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      setMessage('User created successfully');
      // Clear any existing errors
      setErrors({});
    } catch (error) {
      setMessage('Error creating user: ' + error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MERN Testing App</h1>
        <p>Welcome to your MERN stack application!</p>
        <p>Server is running on port 5000</p>
      </header>
      
      <main>
        <UserList />
        
        <div>
          <h2>Create New User</h2>
          <UserForm onSubmit={handleUserSubmit} />
          
          {/* Display validation errors */}
          {Object.entries(errors).map(([field, error]) => (
            <div key={field} style={{ color: 'red' }}>
              {error}
            </div>
          ))}
          
          {/* Display success/error messages */}
          {message && (
            <div style={{ color: message.includes('Error') ? 'red' : 'green' }}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;