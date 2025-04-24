const express = require('express');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ Create a comment
router.post('/addComments', authMiddleware, async (req, res) => {
  const { forumId, content } = req.body;
  try {
    const comment = new Comment({
      forumId,
      userId: req.user.id,
      content,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment', error: err.message });
  }
});

// ✅ Get all comments for a forum
router.get('/getAllComments/:forumId', async (req, res) => {
  try {
    const comments = await Comment.find({ forumId: req.params.forumId }).populate('userId', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
});

// ✅ Delete a comment (only by owner)
router.delete('/deleteComment/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting comment', error: err.message });
  }
});

module.exports = router;
