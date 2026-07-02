import multer from "multer";
import path from "path";

// Set up where and how to save the files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure you create an "uploads" folder in your backend root!
  },
  filename: function (req, file, cb) {
    // Gives the file a unique name using the current timestamp
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

// Filter to make sure they only upload images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter });