import type { IncomingMessage, ServerResponse } from 'node:http';

const BLOCKED_MAIN_HOSTS = new Set([
  'portfolio.eng-abdullah.work',
  'www.portfolio.eng-abdullah.work',
]);

const VALID_STORAGE_PATH = /^projects\/[a-z0-9_-]+\/[a-z0-9_-]+\.html$/i;

const VIEWER_CSP = [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
  "style-src 'self' 'unsafe-inline' data: blob:",
  "img-src 'self' data: blob:",
  "font-src 'self' data: blob:",
  "connect-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  'frame-ancestors https://portfolio.eng-abdullah.work https://abdullah-sherif-portfolio.vercel.app https://*.vercel.app https://viewer.eng-abdullah.work http://localhost:5173 http://127.0.0.1:5173',
].join('; ');

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Method Not Allowed');
    return;
  }

  // 1. Strict Host Isolation: NEVER execute uploaded HTML on the main portfolio origin
  const rawHost = String(
    req.headers['x-forwarded-host'] || req.headers.host || ''
  )
    .toLowerCase()
    .split(':')[0]
    ?.trim();

  if (!rawHost || BLOCKED_MAIN_HOSTS.has(rawHost)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(
      'Forbidden: Standalone 3D viewer HTML cannot be served on the main portfolio origin. Use the isolated viewer origin.'
    );
    return;
  }

  // 2. Strict Storage Path Validation (prevents SSRF & path traversal)
  const reqUrl = new URL(req.url || '/', `https://${rawHost}`);
  const storagePath = (reqUrl.searchParams.get('path') || '').trim();

  if (!VALID_STORAGE_PATH.test(storagePath)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Invalid viewer path.');
    return;
  }

  // 3. Fetch uploaded standalone HTML strictly from our Supabase Storage bucket
  const supabaseUrl = (
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://xgrhtukgudnbmtovghlw.supabase.co'
  ).replace(/\/$/, '');

  const upstreamUrl = `${supabaseUrl}/storage/v1/object/public/portfolio-3d-viewers/${storagePath}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      redirect: 'follow',
    });

    if (!upstream.ok) {
      res.statusCode = upstream.status === 404 ? 404 : 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(
        upstream.status === 404
          ? '3D viewer file not found.'
          : 'Failed to load 3D viewer file.'
      );
      return;
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', VIEWER_CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
      'Cache-Control',
      'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
    );
    res.end(req.method === 'HEAD' ? undefined : buffer);
  } catch {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Error fetching 3D viewer file.');
  }
}
