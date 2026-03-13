import { Router, Request, Response } from 'express';
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';

console.enter();

// #region ====================== START ========================================

const SF_BASE = 'https://www.sfserviceguide.org/api';

const sfProxyRouter = Router();

sfProxyRouter.post('/*', async (req: Request, res: Response) => {
  log.enter('sf-proxy POST', log.brack);

  const sfPath = (req.params as any)[0] || '';
  const url = `${SF_BASE}/${sfPath}`;

  try {
    const sfRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.sfserviceguide.org',
        'Referer': 'https://www.sfserviceguide.org/organizations/new'
      },
      body: JSON.stringify(req.body)
    });

    const data = await sfRes.json().catch(() => ({}));
    console.super('SF Proxy Response', sfRes.status, data);
    log.retrn('sf-proxy POST', log.kcarb);
    res.status(sfRes.status).json(data);
  } catch (err: any) {
    log.retrn('sf-proxy POST error', log.kcarb);
    res.status(502).json({ error: 'SF proxy request failed', detail: err.message });
  }
});

export default sfProxyRouter;

// #endregion ------------------------------------------------------------------

console.leave();
