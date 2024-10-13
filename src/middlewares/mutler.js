const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const userModel = require("../models/userModel");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "media",
    allowed_formats: ["jpeg", "jpg", "png", "gif", "mp4", "mov", "avi"],
  },
});

// Set default upload limits
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Default limit; can adjust per user
  fileFilter: async (req, file, cb) => {
    // Here you can do any additional checks before upload
    try {
      const RemainingUploadedSize = await getRemainingStorage(req.user._id);
      const totalFilesSize = req.files ? req.files.reduce((total, f) => total + f.size, 0) : 0;

      if (file.size + totalFilesSize > RemainingUploadedSize) {
        return cb(new Error(`Upload limit exceeded. Your limit is ${RemainingUploadedSize / (1024 * 1024)} MB.`));
      }
      cb(null, true);
    } catch (error) {
      cb(error);
    }
  },
});

const getRemainingStorage = async (_id) => {
  const user = await userModel.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  return user.storageLimit - user.storageUsed; // Return remaining storage
};

module.exports = { upload };
