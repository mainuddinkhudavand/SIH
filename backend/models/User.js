import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  state: String,
  district: String,
  town: String,
  pin: String,
  street: String,
});

const SsoProviderSchema = new mongoose.Schema({
  provider: { type: String, enum: ["local", "google", "digilocker", "saml"], default: "local" },
  providerId: { type: String },
  lastLogin: { type: Date, default: Date.now },
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    // Unique Identifiers
    citizenId: {
      type: String,
      unique: true,
      required: true,
      default: () => `CTZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
    },
    businessId: {
      type: String,
      unique: true,
      sparse: true,
      default: () => `BIZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
    },

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: false },
    password: { type: String, required: function() { return this.ssoProvider?.provider === "local"; } },

    // Role-Based Access Control
    role: {
      type: String,
      enum: ["citizen", "official", "admin", "municipal_officer", "revenue_officer", "health_officer"],
      default: "citizen",
      required: true
    },

    // Federated Identity & SSO
    ssoProvider: {
      type: SsoProviderSchema,
      default: () => ({ provider: "local" })
    },

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
export default User;
