const BLOCKED_MAIN_HOSTS = new Set([
  'portfolio.eng-abdullah.work',
  'www.portfolio.eng-abdullah.work',
]);

const VALID_STORAGE_PATH = /^projects\/[a-z0-9_-]+\/[a-z0-9_-]+\.html$/i;

const VIEWER_CSP = [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' data: blob:",
  "style-src 'self' 'unsafe-inline' data: blob:",
  "img-src 'self' data: blob:",
  "font-src 'self' data: blob:",
  "connect-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  'frame-ancestors https://portfolio.eng-abdullah.work https://abdullah-sherif-portfolio.vercel.app https://*.vercel.app https://viewer.eng-abdullah.work http://localhost:5173 http://127.0.0.1:5173',
].join('; ');

const EDRAWINGS_PDM_CROSS_ORIGIN_RE =
  /(?<!try\{)while\s*\(\s*parent\.parent\s*!=\s*parent\s*\)\s*\{\s*parent\s*=\s*parent\.parent;\s*if\s*\(\s*parent\.solidworks\s*&&\s*parent\.solidworks\.pdm\s*\)\s*\{\s*pdm\s*=\s*parent\.solidworks\.pdm;\s*break;?\s*\}\s*\}/g;

/**
 * Streams standalone eDrawings HTML while wrapping SolidWorks' unguarded
 * cross-origin `parent.solidworks` PDM lookup in a try/catch block so it
 * renders cleanly inside a cross-origin iframe on the main portfolio site.
 */
function createEdrawingsCrossOriginPatchStream(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder();
  const TAIL_KEEP = 256;
  let pending = '';

  const patchChunk = (text: string): string => {
    if (!text.includes('parent.solidworks')) return text;
    return text.replace(EDRAWINGS_PDM_CROSS_ORIGIN_RE, (match) => `try{${match}}catch(_e){}`);
  };

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      pending += decoder.decode(chunk, { stream: true });
      if (pending.length <= TAIL_KEEP) return;

      const patched = patchChunk(pending);
      const emitEnd = patched.length - TAIL_KEEP;
      if (emitEnd > 0) {
        controller.enqueue(encoder.encode(patched.slice(0, emitEnd)));
        pending = patched.slice(emitEnd);
      } else {
        pending = patched;
      }
    },
    flush(controller) {
      pending += decoder.decode();
      if (pending.length > 0) {
        controller.enqueue(encoder.encode(patchChunk(pending)));
        pending = '';
      }
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  // 1. Strict Host Isolation: NEVER execute uploaded HTML on the main portfolio origin
  const rawHost = (
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    new URL(request.url).host ||
    ''
  )
    .toLowerCase()
    .split(':')[0]
    ?.trim();

  if (!rawHost || BLOCKED_MAIN_HOSTS.has(rawHost)) {
    return new Response(
      'Forbidden: Standalone 3D viewer HTML cannot be served on the main portfolio origin. Use the isolated viewer origin.',
      {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }

  // 2. Strict Storage Path Validation (prevents SSRF & path traversal)
  const reqUrl = new URL(request.url);
  const storagePath = (reqUrl.searchParams.get('path') || '').trim();

  if (!VALID_STORAGE_PATH.test(storagePath)) {
    return new Response('Invalid viewer path.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 3. Stream uploaded standalone HTML directly from Supabase Storage (supports 15-50 MB eDrawings exports without 4.5 MB buffer limit)
  const supabaseUrl = (
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://xgrhtukgudnbmtovghlw.supabase.co'
  ).replace(/\/$/, '');

  const upstreamUrl = `${supabaseUrl}/storage/v1/object/public/portfolio-3d-viewers/${storagePath}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(
        upstream.status === 404 || upstream.status === 400
          ? '3D viewer file not found.'
          : 'Failed to load 3D viewer file.',
        {
          status: upstream.status === 404 || upstream.status === 400 ? 404 : 502,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }
      );
    }

    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': VIEWER_CSP,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cache-Control':
        'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    });

    const patchedStream = upstream.body.pipeThrough(
      createEdrawingsCrossOriginPatchStream()
    );

    return new Response(patchedStream, {
      status: 200,
      headers,
    });
  } catch {
    return new Response('Error fetching 3D viewer file.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
