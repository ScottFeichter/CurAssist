import { Router, Request, Response } from 'express';
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';

console.enter();

// #region ====================== START ========================================

/**
 * Base URL for the SF Service Guide API.
 * All proxy requests are forwarded to this base.
 *
 * WHY THIS PROXY EXISTS:
 * 1. CORS — the browser cannot POST directly to sfserviceguide.org from our domain.
 *    The proxy makes the call server-side, bypassing CORS restrictions.
 * 2. Cookies — SFSG requires session cookies on write requests (POST).
 *    These are NOT login credentials — SFSG has no authentication or login.
 *    They are standard session cookies set by sfserviceguide.org on any page visit.
 *    The proxy obtains them via a preflight GET to sfserviceguide.org before each POST,
 *    extracts the Set-Cookie headers, and forwards them on the actual API call.
 *
 * COOKIE EXTRACTION:
 * Node's built-in fetch (undici) handles Set-Cookie headers inconsistently across versions.
 * The proxy tries three extraction methods as fallbacks:
 *   1. getSetCookie() — the standard Headers API method
 *   2. raw()['set-cookie'] — node-fetch style raw header access
 *   3. headers.get('set-cookie') — returns comma-joined string, split manually
 * The preflight uses redirect: 'manual' to capture cookies from redirect responses.
 */
const SF_BASE = 'https://www.sfserviceguide.org/api';

const sfProxyRouter = Router();

sfProxyRouter.get('/v2/resources/:id', async (req: Request, res: Response) => {
  log.enter('sf-proxy GET resource', log.brack);
  const url = `${SF_BASE}/v2/resources/${req.params.id}`;
  try {
    const sfRes = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.sfserviceguide.org',
        'Referer': 'https://www.sfserviceguide.org/organizations/new'
      }
    });
    const data = await sfRes.json().catch(() => ({}));
    log.retrn('sf-proxy GET resource', log.kcarb);
    res.status(sfRes.status).json(data);
  } catch (err: any) {
    log.retrn('sf-proxy GET resource error', log.kcarb);
    res.status(502).json({ error: 'SF proxy request failed', detail: err.message });
  }
});

sfProxyRouter.post('/*', async (req: Request, res: Response) => {
  log.enter('sf-proxy POST', log.brack);

  const sfPath = (req.params as any)[0] || '';
  const url = `${SF_BASE}/${sfPath}`;

  log.infor(`sf-proxy POST -> ${url}`);
  log.infor(`sf-proxy request body: ${JSON.stringify(req.body)}`);

  try {
    // Obtain SFSG cookies by hitting the new org page first
    const preflight = await fetch('https://www.sfserviceguide.org/organizations/new', {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
      },
      redirect: 'manual'
    });
    // Node fetch may return Set-Cookie via getSetCookie(), raw headers, or headers.get()
    const sfsgCookies: string[] = 
      (preflight.headers as any).getSetCookie?.() ||
      (preflight.headers as any).raw?.()?.['set-cookie'] ||
      [];
    // Fallback: try headers.get('set-cookie') which returns a comma-joined string
    let cookieString = sfsgCookies.map((c: string) => c.split(';')[0]).join('; ');
    if (!cookieString) {
      const raw = preflight.headers.get('set-cookie') || '';
      if (raw) cookieString = raw.split(',').map((c: string) => c.split(';')[0].trim()).join('; ');
    }
    log.infor(`sf-proxy preflight status: ${preflight.status}, cookies obtained: ${sfsgCookies.length}`);
    log.infor(`sf-proxy cookie string: ${cookieString}`);

    const sfRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.sfserviceguide.org',
        'Referer': 'https://www.sfserviceguide.org/organizations/new',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        ...(cookieString ? { 'Cookie': cookieString } : {})
      },
      body: JSON.stringify(req.body)
    });

    log.infor(`sf-proxy SFSG response status: ${sfRes.status}`);
    const responseText = await sfRes.text();
    log.infor(`sf-proxy SFSG response raw text: ${responseText}`);
    let data;
    try { data = JSON.parse(responseText); } catch { data = { raw: responseText.substring(0, 2000) }; }
    console.super('SF Proxy Response', sfRes.status, data);
    log.retrn('sf-proxy POST', log.kcarb);
    res.status(sfRes.status).json(data);
  } catch (err: any) {
    log.retrn('sf-proxy POST error', log.kcarb);
    console.error('sf-proxy POST exception:', err.message);
    res.status(502).json({ error: 'SF proxy request failed', detail: err.message });
  }
});

export default sfProxyRouter;

// #endregion ------------------------------------------------------------------

console.leave();
