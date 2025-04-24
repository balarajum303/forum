import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/Api';

function ForumForm() {
  const { id } = useParams(); // Edit mode if `id` exists
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    if (id) {
      setLoading(true);
      API.get(`/forums/getById/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const { title, description, tags } = res.data.forum;
        setForm({ title, description, tags: tags?.join(', ') || '' });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load forum details.');
        setLoading(false);
      });
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      if (id) {
        // Edit mode
        await API.put(`/forums/update/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        navigate('/forums', {
          state: { successMessage: 'Forum updated successfully!' }
        });
      } else {
        // Create mode
        await API.post('/forums', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        navigate('/forums', {
          state: { successMessage: 'Forum created successfully!' }
        });
      }
    } catch (err) {
      const apiError = err?.response?.data?.message || 'Failed to save forum.';
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mx-auto mt-5" style={{ maxWidth: '600px' }}>
      <div className="card-body">
        <h4 className="card-title">{id ? 'Edit Forum' : 'Create Forum'}</h4>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              className="form-control"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Forum' : 'Create Forum'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForumForm;
