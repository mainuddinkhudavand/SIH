import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  grievance: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Grievance = mongoose.model('Grievance', grievanceSchema);
export default Grievance;