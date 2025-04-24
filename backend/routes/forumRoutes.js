const express = require('express');
const Forum = require('../models/Forum');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', async (req, res) => {
  const forums = await Forum.find().populate('createdBy', 'username');
  res.json(forums);
});

router.post('/',authMiddleware, async (req, res) => {
  const { title, description, tags, createdBy } = req.body;
  const newForum = new Forum({ title, description, tags, createdBy });
  await newForum.save();
  res.status(201).json(newForum);
});

// Get single forum with comments
router.get('/getById/:id',authMiddleware, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id).populate('createdBy', 'username');
    const comments = await Comment.find({ forum: req.params.id }).populate('user', 'username');
    res.json({ forum, comments });
  } catch (err) {
    res.status(404).json({ message: 'Forum not found', error: err.message });
  }
});

// Update forum
router.put('/update/:id',authMiddleware, async (req, res) => {
  const { title, description, tags } = req.body;
  try {
    const updatedForum = await Forum.findByIdAndUpdate(
      req.params.id,
      { title, description, tags },
      { new: true }
    );
    if (!updatedForum) return res.status(404).json({ message: 'Forum not found' });
    res.json(updatedForum);
  } catch (err) {
    res.status(500).json({ message: 'Error updating forum', error: err.message });
  }
});

// Delete forum
router.delete('/delete/:id',authMiddleware, async (req, res) => {
  try {
    const deletedForum = await Forum.findByIdAndDelete(req.params.id);
    if (!deletedForum) return res.status(404).json({ message: 'Forum not found' });
    
    // Optionally, delete comments related to the forum
    await Comment.deleteMany({ forum: req.params.id });

    res.json({ message: 'Forum deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting forum', error: err.message });
  }
});

// Add comment to a forum
// router.post('/:id/comments', async (req, res) => {
//   const { content, user } = req.body;
//   try {
//     const newComment = new Comment({ content, forum: req.params.id, user });
//     await newComment.save();
//     res.status(201).json(newComment);
//   } catch (err) {
//     res.status(500).json({ message: 'Error adding comment', error: err.message });
//   }
// })

module.exports = router;