// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/mongoose.js';
import { Campaign } from './lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();

  const { method } = req;
  const { id, status, slug } = req.query;

  switch (method) {
    case 'GET':
      try {
        if (id) {
          const campaign = await Campaign.findById(id);
          return res.status(200).json(campaign);
        }
        if (slug) {
          const campaign = await Campaign.findOne({ slug });
          return res.status(200).json(campaign);
        }
        // General query
        const query: any = {};
        if (status) query.status = status;
        if (req.query.owner_id) query.owner_id = req.query.owner_id;
        
        const campaigns = await Campaign.find(query).sort({ created_at: -1 });
        return res.status(200).json(campaigns);
      } catch (error) {
        return res.status(400).json({ success: false, error: String(error) });
      }

    case 'POST':
      try {
        const campaign = await Campaign.create(req.body);
        return res.status(201).json(campaign);
      } catch (error) {
        return res.status(400).json({ success: false, error: String(error) });
      }

    case 'PATCH': // Used for updates like status approvals
      try {
        const campaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(campaign);
      } catch (error) {
        return res.status(400).json({ success: false, error: String(error) });
      }
    
    case 'DELETE':
        try {
          await Campaign.findByIdAndDelete(id);
          return res.status(200).json({ success: true });
        } catch (error) {
          return res.status(400).json({ success: false, error: String(error) });
        }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
