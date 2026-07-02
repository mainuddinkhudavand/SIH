import mongoose from "mongoose";

// ✅ Address sub-schema
const AddressSchema = new mongoose.Schema({
  state: String,
  town: String,
  pin: String,
  street: String,
});

// ✅ Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return passwordRegex.test(value);
        },
        message:
          "Password must be at least 6 characters long, include uppercase, lowercase, a number, and a symbol.",
      },
    },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    aadhaarNumber: String,
    address: AddressSchema,
    kycCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// ✅ Default export for clean imports
export default User;