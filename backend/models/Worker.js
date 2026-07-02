import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  phone: { type: String }
}, { timestamps: true });

// Hash password before saving
workerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

workerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Worker", workerSchema, "field_workers");