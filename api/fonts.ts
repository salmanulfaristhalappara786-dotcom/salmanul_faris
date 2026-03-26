import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/mongoose.js';
import { Font } from './lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await dbConnect();
  } catch (dbErr) {
    return res.status(500).json({ error: "Database connection failed" });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const fonts = await Font.find({}).sort({ created_at: -1 });
        return res.status(200).json(fonts);
      } catch (error) {
        return res.status(400).json({ error: String(error) });
      }

    case 'POST':
      try {
        const { name, url } = req.body;
        // Check if font already exists
        const existing = await Font.findOne({ url });
        if (existing) return res.status(200).json(existing);

        const font = await Font.create({ name, url });
        return res.status(201).json(font);
      } catch (error) {
        return res.status(400).json({ error: String(error) });
      }

    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
