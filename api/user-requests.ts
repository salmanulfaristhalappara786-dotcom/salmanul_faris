// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/mongoose.js';
import { UserRequest } from './lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();

  const { method } = req;
  const { user_id, id } = req.query;

  switch (method) {
    case 'GET':
      try {
        if (user_id) {
          const profile = await UserRequest.findOne({ user_id });
          return res.status(200).json(profile);
        }
        const requests = await UserRequest.find({}).sort({ created_at: -1 });
        return res.status(200).json(requests);
      } catch (error) {
        return res.status(400).json({ success: false, error: String(error) });
      }

    case 'POST':
      try {
        const request = await UserRequest.create(req.body);
        return res.status(201).json(request);
      } catch (error) {
        return res.status(400).json({ success: false, error: String(error) });
      }

    case 'PATCH':
        try {
          const request = await UserRequest.findByIdAndUpdate(id, req.body, { new: true });
          return res.status(200).json(request);
        } catch (error) {
          return res.status(400).json({ success: false, error: String(error) });
        }

    case 'DELETE':
        try {
          await UserRequest.findByIdAndDelete(id);
          return res.status(200).json({ success: true });
        } catch (error) {
          return res.status(400).json({ success: false, error: String(error) });
        }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
