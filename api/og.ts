// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from './lib/mongoose.js';
import { Campaign } from './lib/models.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  const ua = req.headers['user-agent'] || '';
  const isBot = /bot|whatsapp|telegram|facebook|twitter|linkedin|discord|slack|preview|crawl|spider/i.test(ua);

  // Dynamically detect the domain from the request
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'focl-knot.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  // IF A REAL USER HITS THIS FUNCTION (fallback if Vercel `has` regex misses them)
  // Simply fetch the actual index.html from our own domain and serve it inline.
  if (!isBot) {
    try {
      // Fetch the static index.html from the root path
      const htmlReq = await fetch(`${baseUrl}/`);
      const htmlText = await htmlReq.text();
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(htmlText);
    } catch (e) {
      console.error('Fallback fetch error:', e);
      // Absolute last resort redirect
      res.setHeader('Location', `${baseUrl}/?redirect=/participate/${slug}`);
      return res.status(302).end();
    }
  }

  // ONLY FOR BOTS — fetch campaign data and return OG meta tags
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
