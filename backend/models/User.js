import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  state: String,
  district: String,
  town: String,
  pin: String,
  street: String,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    aadhaarNumber: String,
    address: AddressSchema,
    kycCompleted: { type: Boolean, default: false },
    profilePictureUrl: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// ✅ Default export for clean imports
export default User;
