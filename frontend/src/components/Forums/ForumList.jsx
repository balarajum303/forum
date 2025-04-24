import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../utils/Api';

function ForumList() {
  const [forums, setForums] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null); // Add user state
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch the current logged-in user from localStorage
  const loadUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData)); // Parse and set user data
    } else {
      setUser(null); // No user, so set to null
    }
  };

  const fetchForums = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/forums', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForums(res.data);
    } catch (err) {
      setError('Failed to load forums');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this forum?');
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/forums/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForums(forums.filter(forum => forum._id !== id));
      setMessage('Forum deleted successfully!');
    } catch (err) {
      alert('Delete failed');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    
    loadUserData(); // Load user data when the component is mounted
    fetchForums();

    // Handle post/update success messages
    if (location.state?.successMessage) {
      setMessage(location.state.successMessage);
      window.history.replaceState({}, document.title); // Clear message on back button
    }
  }, [navigate, location]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Forums</h2>
        <button className="btn btn-success" onClick={() => navigate('/create')}>Create Forum</button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {forums.length === 0 ? (
        <p>No forums available.</p>
      ) : (
        forums.map(forum => (
          <div className="card mb-3" key={forum._id}>
            <div className="card-body">
              <h5 className="card-title">{forum.title}</h5>
              <p className="card-text">{forum.description}</p>
              <p className="text-muted">By: {forum.creator?.username || 'Unknown'}</p>
              <button className="btn btn-primary me-2" onClick={() => navigate(`/forumDetails/${forum._id}`)}>
                View
              </button>
            
                <>
                  <button className="btn btn-warning me-2" onClick={() => navigate(`/editForums/${forum._id}`)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(forum._id)}>
                    Delete
                  </button>
                </>
          
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ForumList;
