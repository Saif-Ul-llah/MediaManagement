const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/authMiddleware");
const {
  UploadMedia,
  GetAllMedia,
  GetMediaById,
  DeleteMediaById,
} = require("../../controllers/mediaController"); // Make sure this is correct
const { upload } = require("../../middlewares/mutler");

router.post(
  "/upload-media",
  protect,
  upload.array("mediaFiles", 10),
  UploadMedia
);

router.get("/MediaByUser", protect, GetAllMedia);
router.get("/Media/:mediaId", protect, GetMediaById);
router.delete("/DeleteMedia/:mediaId", protect, DeleteMediaById);

module.exports = router;
