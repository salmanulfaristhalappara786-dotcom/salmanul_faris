import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await client.connect();
    const db = client.db('salmanulfaris');
    const settings = db.collection('settings');

    switch (req.method) {
      case 'GET':
        const doc = await settings.findOne({ type: 'site_config' });
        return res.status(200).json(doc || { 
            hero_images: ["/_NAS8219.JPG", "/DSC01910.JPG"],
            about_images: ["/_NAS8219.JPG"]
        });

      case 'POST':
      case 'PUT':
        const { hero_images, about_images } = req.body;
        const result = await settings.updateOne(
          { type: 'site_config' },
          { $set: { hero_images, about_images, updatedAt: new Date() } },
          { upsert: true }
        );
        return res.status(200).json({ success: true, result });

      default:
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
