import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/Api';

function ForumDetail({ user }) {
  const { id } = useParams();
  const [forum, setForum] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchForum();
    fetchComments();
  }, [id]);

  const fetchForum = async () => {
    try {
      const res = await API.get(`/forums/getById/${id}`);
      console.log("forum get res", res.data);
      setForum(res.data.forum);
    } catch {
      setError('Failed to fetch forum details.');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/getAllComments/${id}`);
      console.log("comments get res", res.data);
      setComments(res.data);
    } catch {
      setError('Failed to fetch comments.');
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newComment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    const payload = {
      forumId: id,
      content: newComment,
    };

    try {
      setLoading(true);
      await API.post('/comments/addComments', payload);
      setNewComment('');
      setSuccessMessage('Comment posted successfully!');
      fetchComments();
    } catch {
      setError('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/deleteComment/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      setSuccessMessage('Comment deleted successfully!');
    } catch {
      setError('Failed to delete comment. or Only Admin can Delete');
    }
  };

  return (
    <div className="container mt-4">
      <h2>{forum.title}</h2>
      <p>{forum.description}</p>
      <p><strong>By:</strong> {forum.creator?.username || 'Unknown'}</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="comments-section mt-4">
        <h4>Comments</h4>
        <form onSubmit={handlePostComment}>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Write a comment..."
              value={newComment}
              onChange={handleCommentChange}
            />
          </div>
          <button className="btn btn-primary" disabled={loading || !newComment.trim()}>
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="mt-4">
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div className="card mb-2" key={c._id}>
                <div className="card-body">
                  <p>{c.content}</p>
                  <small className="text-muted">
                    By: {c.userId?.username || 'Unknown'} | {new Date(c.timestamp).toLocaleString()}
                  </small>
                 
                    <button
                      className="btn btn-sm btn-danger float-end"
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      Delete
                    </button>
                 
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ForumDetail;
