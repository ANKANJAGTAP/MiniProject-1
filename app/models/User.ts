import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  type: { type: String, enum: ['player', 'owner'], required: true },
  name: String,
  email: String,
  phone: String,
  businessName: String,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
