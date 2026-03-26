// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/mongoose.js';
import { Campaign } from './lib/models.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  const ua = req.headers['user-agent'] || '';
  const isBot = /bot|crawl|slurp|spider|whatsapp|telegram|facebookexternalhit|twitterbot|linkedinbot|discordbot|slackbot|preview|curl/i.test(ua);

  let title = 'Salmanul Faris — Creative Studio';
  let description = 'Participate and create your own personalized poster!';
  let image = 'https://salmanulfaris.vercel.app/logo.png';
  const pageUrl = `https://salmanulfaris.vercel.app/participate/${slug}`;

  try {
    await dbConnect();
    const campaign = await Campaign.findOne({ slug });
    if (campaign) {
      title = `${campaign.title} — Salmanul Faris`;
      description = campaign.description || `Join the ${campaign.title} campaign and create your personalized poster!`;
      image = campaign.frame_url || image;
    }
  } catch (e) {
    console.error('OG fetch error:', e);
  }

  if (isBot) {
    // Bot — return a minimal OG HTML page (no redirect, bots ignore it)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:site_name" content="Salmanul Faris" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <a href="${pageUrl}">Click here to participate</a>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).send(html);
  }

  // Real user — serve the React SPA index.html
  try {
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch {
    // Fallback if dist not found (dev mode)
    res.setHeader('Location', pageUrl);
    return res.status(302).end();
  }
}
