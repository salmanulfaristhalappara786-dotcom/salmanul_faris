import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  google_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  picture: { type: String },
  role: { type: String, default: 'user' }, // 'user' or 'admin'
  created_at: { type: Date, default: Date.now },
});

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  frame_url: { type: String, required: true },
  placeholders: { type: Array, default: [] },
  status: { type: String, default: 'pending', enum: ['pending', 'active', 'rejected'] },
  owner_id: { type: String },
  created_at: { type: Date, default: Date.now },
});

const SubmissionSchema = new mongoose.Schema({
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  image_url: { type: String, required: true },
  user_data: { type: Object, default: {} },
  frame_title: { type: String },
  user_id: { type: String },
  created_at: { type: Date, default: Date.now },
});

const UserRequestSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  gmail: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  created_at: { type: Date, default: Date.now },
});

const FontSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
export const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
export const UserRequest = mongoose.models.UserRequest || mongoose.model('UserRequest', UserRequestSchema);
export const Font = mongoose.models.Font || mongoose.model('Font', FontSchema);
