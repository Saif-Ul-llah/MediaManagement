const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'crown', 'admin'] }, // Enforce role types
  storageUsed: { type: Number, default: 0 },
  storageLimit: { type: Number, default: 10 * 1024 * 1024 },
});


userSchema.pre("save", async function (next) {

  if (this.isNew || this.isModified("role")) {
    switch (this.role) {
      case 'user':
        this.storageLimit = 10 * 1024 * 1024; // 10 MB
        break;
      case 'crown':
        this.storageLimit = 50 * 1024 * 1024; // 50 MB
        break;
      case 'admin':
        this.storageLimit = Infinity; // No limit
        break;
      default:
        this.storageLimit = 10 * 1024 * 1024; 
    }
  }

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
