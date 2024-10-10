// models/Group.js
const mongoose = require('mongoose');

// Define the Group Schema
const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: [true, 'Group name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Group name must be at least 3 characters long'],
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  channels: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Export the Group Model
module.exports = mongoose.model('Group', GroupSchema);
