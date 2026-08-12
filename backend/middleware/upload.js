import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up where and how to save the files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gives the file a unique name using the current timestamp
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

// Filter to make sure they only upload images
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });