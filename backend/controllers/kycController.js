// backend/controllers/kycController.js
import User from "../models/User.js";

export const saveKyc = async (req, res) => {
  const { aadhaar, address } = req.body;
  const user = await User.findById(req.user._id);
  user.kyc = { aadhaar, address };
  await user.save();
  res.json({ message: "KYC updated", kyc: user.kyc });
};
