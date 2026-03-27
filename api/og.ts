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

  // Dynamically detect the domain from the request
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'focl-knot.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  // Real user — serve the SPA index.html directly (bundled via includeFiles)
  if (!isBot) {
    try {
      const indexPath = path.join(process.cwd(), 'dist', 'index.html');
      const html = fs.readFileSync(indexPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      return res.status(200).send(html);
    } catch (e) {
      console.error('Failed to read dist/index.html:', e);
      // Fallback: show a loading page that refreshes
      return res.status(200).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Loading...</title><style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:system-ui;background:#60A5FA;color:white;text-align:center;}</style></head><body><div><h2>⏳ Loading...</h2><p>Please wait...</p></div></body></html>`);
    }
  }

  // Bot — fetch OG data and return meta tags
  let title = 'Salmanul Faris — Creative Studio';
  let description = 'Participate and create your own personalized poster!';
  let image = `${baseUrl}/logo.png`;
  const pageUrl = `${baseUrl}/participate/${slug}`;

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
