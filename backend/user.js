const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Create a user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Store emails in lowercase
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'User', // Default role is 'User', can be changed to 'Admin'
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Hash the user's password before saving it
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password is modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password with bcrypt
  next();
});

// Compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Compare hashed password
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
