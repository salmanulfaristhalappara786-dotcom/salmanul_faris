import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from './lib/mongoose.js';
import { User } from './lib/models.js';
import { signToken } from './lib/auth.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  await dbConnect();

  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: 'id_token is required' });

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: 'Invalid token payload' });

    const { sub: google_id, email, name, picture } = payload;

    // Hardcoded Admin email list (for security during migration)
    const adminEmails = ['fariskaithakath@gmail.com', 'admin@focalknot.com'];
    const role = adminEmails.includes(email!) ? 'admin' : 'user';

    // Upsert User
    const user = await User.findOneAndUpdate(
      { google_id },
      { email, name, picture, role },
      { upsert: true, new: true }
    );

    // Sign local JWT
    const local_token = signToken({ id: user._id, role: user.role, email: user.email });

    return res.status(200).json({
      token: local_token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Auth Error:', error.message);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
