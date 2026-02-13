import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { parseUserAgent } from './04_parseUserAgent';

console.enter();

// #region ====================== START ========================================


 // Helper to extract selected headers if present
export const getImportantHeaders = (headers: any) => {
  log.enter("getImportantHeaders", log.brack);

  const userAgent = headers['user-agent'];

  log.retrn("getImportantHeaders", log.kcarb);
  return Object.entries({
      // Client identification
      'user-agent': userAgent ? parseUserAgent(userAgent) : undefined,
      'origin': headers.origin,
      'referer': headers.referer,

      // Authentication/Authorization
      'authorization': headers.authorization,
      'cookie': headers.cookie,

      // Request context
      'type': headers['content-type'] ?? 'none',

      // Client network
      'x-forwarded-for': headers['x-forwarded-for'],
      'x-real-ip': headers['x-real-ip'],

      // Security
      'x-csrf-token': headers['x-csrf-token'],
      'x-requested-with': headers['x-requested-with'],
  })
  .filter(([key, value]) =>
      key === 'content-type' || value !== undefined
  )
  .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value
  }), {});
};


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
