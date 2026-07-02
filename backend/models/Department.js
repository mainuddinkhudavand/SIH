import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required for department login"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash the password before saving
departmentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Helper method to check the password during login
departmentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ FIXED: Using ES6 export default
export default mongoose.model("Department", departmentSchema);