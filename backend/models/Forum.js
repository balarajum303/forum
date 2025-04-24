const mongoose = require('mongoose');
const forumSchema = new mongoose.Schema({
  title: String,
  description: String,
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Forum', forumSchema);