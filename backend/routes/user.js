import express from 'express';
import auth from '../middleware/auth.js';
import { upload } from '../middleware/upload.js'; // 🚀 Import upload middleware

const router = express.Router();

// Complete KYC
router.post('/kyc', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { aadhaarNumber, address } = req.body; // address: {state,town,pin,street}
  if (!aadhaarNumber || !address) return res.status(400).json({ message: 'Missing KYC fields' });
  try {
    req.user.aadhaarNumber = aadhaarNumber;
    req.user.address = address;
    req.user.kycCompleted = true;
    await req.user.save();
    return res.json({ message: 'KYC completed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile Details & Picture
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { name, email, phone } = req.body;
  try {
    if (name) req.user.name = name;
    if (email) {
      if (email.toLowerCase() !== req.user.email) {
        const existing = await req.user.constructor.findOne({ email: email.toLowerCase() });
        if (existing) {
          return res.status(400).json({ message: 'Email address is already in use' });
        }
        req.user.email = email.toLowerCase();
      }
    }
    if (phone) {
      if (phone !== req.user.phone) {
        const existing = await req.user.constructor.findOne({ phone });
        if (existing) {
          return res.status(400).json({ message: 'Phone number is already in use' });
        }
        req.user.phone = phone;
      }
    }

    if (req.file) {
      req.user.profilePictureUrl = `/uploads/${req.file.filename}`;
    }

    await req.user.save();
    return res.json({ message: 'Profile updated successfully', user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
