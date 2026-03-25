import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/mongoose.js';
import { Submission } from './lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();

  const { method } = req;
  const { campaign_id, id } = req.query;

  switch (method) {
    case 'GET':
      try {
        if (id) {
            const submission = await Submission.findById(id);
            return res.status(200).json(submission);
        }
        const query: any = {};
        if (campaign_id) query.campaign_id = campaign_id;
        
        const submissions = await Submission.find(query).sort({ created_at: -1 });
        return res.status(200).json(submissions);
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }

    case 'POST':
      try {
        const submission = await Submission.create(req.body);
        return res.status(201).json(submission);
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }

    case 'DELETE':
        try {
          await Submission.findByIdAndDelete(id);
          return res.status(200).json({ success: true });
        } catch (error) {
          return res.status(400).json({ success: false, error });
        }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
