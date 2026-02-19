const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "menu-items",
    allowed_formats: ["jpg", "png", "webp", "jpeg"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

module.exports = multer({ storage, fileFilter });