import express from 'express';
import auth from '../middleware/auth.js';

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

export default router;
