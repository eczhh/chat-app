// models/User.js
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// Define the User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    enum: ['superadmin', 'groupadmin', 'User'],
    default: 'User',
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Pre-save Hook to Hash Passwords
// UserSchema.pre('save', async function (next) {
//   try {
//     // Only hash the password if it has been modified (or is new)
//     if (!this.isModified('password')) {
//       return next();
//     }

//     // Generate a salt
//     const salt = await bcrypt.genSalt(10);

//     // Hash the password using the salt
//     const hashedPassword = await bcrypt.hash(this.password, salt);

//     // Replace the plaintext password with the hashed one
//     this.password = hashedPassword;

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Method to Compare Passwords
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// Export the User Model
module.exports = mongoose.model('usrs', UserSchema);
