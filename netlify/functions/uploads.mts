import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
export default async (req: Request) => {
  if (!['GET','HEAD'].includes(req.method)) return new Response('Method not allowed',{status:405});
  const key = new URL(req.url).pathname.replace(/^\/uploads\//,'');
  const match = key.match(/^(services|gallery)\/[a-f0-9-]+\.(jpg|png|webp|gif|avif)$/);
  if (!match) return new Response('Not found',{status:404});
  try {
    const data = await getStore('studio-uploads').get(key,{type:'arrayBuffer'});
    if (!data) return new Response('Not found',{status:404});
    return new Response(data,{headers:{'Content-Type':`image/${match[2] === 'jpg'?'jpeg':match[2]}`,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=31536000, immutable'}});
  } catch { return new Response('Image unavailable',{status:503}); }
};
export const config: Config = { path:'/uploads/*' };
