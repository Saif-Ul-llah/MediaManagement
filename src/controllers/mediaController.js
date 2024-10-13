const Media = require("../models/media");
const userModel = require("../models/userModel");

const UploadMedia = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files were uploaded.",
        });
      }
  
      const totalUploadSize = req.files.reduce(
        (total, file) => total + file.size,
        0
      );
  
      const user = await userModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
  
      if (user.storageUsed + totalUploadSize > user.storageLimit) {
        return res.status(400).json({
          success: false,
          message: `Upload exceeds storage limit. Your limit is ${
            user.storageLimit / (1024 * 1024)
          } MB.`,
        });
      }
  
      user.storageUsed += totalUploadSize;
      await user.save();
  
      const mediaDetails = await Promise.all(
        req.files.map(async (file) => {
          const mediaUrl = file.path;  
          const mediaSize = file.size;
  
          const media = await Media.create({
            userId: req.user._id,
            url: mediaUrl,
            mediaType: file.mimetype,
            size: mediaSize ,
          });
  
          return media;
        })
      );
  
      const remainingStorage = user.storageLimit - user.storageUsed;
  
      res.status(200).json({
        success: true,
        message: "Media uploaded successfully",
        mediaDetails: mediaDetails,
        remainingStorage:Math.round( remainingStorage / (1024 * 1024))+" MB",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  const GetAllMedia = async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
  
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      let media;
      let totalMediaCount;
  
      if (user.role === 'admin') {
        media = await Media.find().skip(skip).limit(limit);
        totalMediaCount = await Media.countDocuments(); 
      } else {
        media = await Media.find({ userId }).skip(skip).limit(limit);
        totalMediaCount = await Media.countDocuments({ userId }); 
      }
  
      if (!media || media.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No media found.",
        });
      }
  
      const totalPages = Math.ceil(totalMediaCount / limit);
  
      const remainingStorage = user.storageLimit - user.storageUsed;
  
      res.status(200).json({
        success: true,
        media,
        remainingStorage: Math.round(remainingStorage / (1024 * 1024)) + " MB",
        pagination: {
          totalItems: totalMediaCount,
          totalPages,
          currentPage: page,
          limitPerPage: limit,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  

const GetMediaById = async (req, res) => {
  try {
    const { mediaId } = req.params;

    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found.",
      });
    }

    res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const DeleteMediaById = async (req, res) => {
    try {
      const { mediaId } = req.params; 
      const userId = req.user._id; 
  

      const media = await Media.findById(mediaId);
  
      if (!media) {
        return res.status(404).json({
          success: false,
          message: "Media not found.",
        });
      }
  
     
      if (media.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this media.",
        });
      }
  
 
      await Media.findByIdAndDelete(mediaId);
  
      
      const user = await userModel.findById(userId);
      user.storageUsed -= media.size;
  
   
      if (user.storageUsed < 0) {
        user.storageUsed = 0;
      }
  
     
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Media deleted successfully, storage updated.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  

module.exports = { UploadMedia, GetAllMedia, GetMediaById ,DeleteMediaById};
