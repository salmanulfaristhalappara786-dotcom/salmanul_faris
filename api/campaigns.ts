// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/mongoose.js';
import { Campaign } from './lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await dbConnect();
  } catch (dbErr) {
    console.error("DB Connect Error:", dbErr);
    return res.status(500).json({ success: false, error: "Database connection failed", details: String(dbErr) });
  }

  const { method } = req;
  const { id, status, slug } = req.query;
  const requesterId = req.headers['x-requester-id'];
  const isAdmin = req.headers['x-requester-role'] === 'admin';

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
        const query: any = {};
        if (status) query.status = status;
        if (req.query.owner_id) query.owner_id = req.query.owner_id;
        
        const campaigns = await Campaign.find(query).sort({ created_at: -1 });
        return res.status(200).json(campaigns);
      } catch (error) {
        console.error("GET Error:", error);
        return res.status(400).json({ success: false, error: String(error) });
      }

    case 'POST':
      try {
        console.log("Creating campaign with body:", JSON.stringify(req.body).slice(0, 500));
        const campaign = await Campaign.create(req.body);
        return res.status(201).json(campaign);
      } catch (error) {
        console.error("POST Error:", error);
        return res.status(500).json({ success: false, error: "Campaign creation failed", details: String(error) });
      }

    case 'PUT':
    case 'PATCH':
      try {
        if (!id) return res.status(400).json({ success: false, error: "Missing id" });
        const campaign = await Campaign.findById(id);
        if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });
        
        // Allow if admin OR owner
        if (!isAdmin && campaign.owner_id && campaign.owner_id !== requesterId) {
            return res.status(403).json({ success: false, error: "Not authorized" });
        }

        const updated = await Campaign.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updated);
      } catch (error) {
        console.error("UPDATE Error:", error);
        return res.status(400).json({ success: false, error: String(error) });
      }
    
    case 'DELETE':
        try {
          if (!id) return res.status(400).json({ success: false, error: "Missing id" });
          const campaign = await Campaign.findById(id);
          if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

          // Allow if admin OR owner
          if (!isAdmin && campaign.owner_id && campaign.owner_id !== requesterId) {
              return res.status(403).json({ success: false, error: "Not authorized to delete" });
          }

          await Campaign.findByIdAndDelete(id);
          return res.status(200).json({ success: true });
        } catch (error) {
          console.error("DELETE Error:", error);
          return res.status(400).json({ success: false, error: String(error) });
        }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
