import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';


console.enter();

// #region ====================== START ========================================


  // Helper function to extract only the browser being used
export const parseUserAgent = (userAgentString: string) => {
    log.enter("parseUserAgent", log.brack);

    // Default values
    let browser = 'unknown';
    let version = 'unknown';
    let os = 'unknown';

    try {
        // Extract browser and version
        if (userAgentString.includes('Chrome/')) {
            browser = 'Chrome';
            version = userAgentString.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgentString.includes('Firefox/')) {
            browser = 'Firefox';
            version = userAgentString.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgentString.includes('Safari/') && !userAgentString.includes('Chrome/')) {
            browser = 'Safari';
            version = userAgentString.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgentString.includes('Edg/')) {
            browser = 'Edge';
            version = userAgentString.match(/Edg\/([0-9.]+)/)?.[1] || 'unknown';
        }

        // Extract OS
        if (userAgentString.includes('Windows')) {
            os = userAgentString.match(/Windows [^;)]*/)?.[0] || 'Windows';
        } else if (userAgentString.includes('Mac OS X')) {
            os = 'macOS';
        } else if (userAgentString.includes('Linux')) {
            os = 'Linux';
        } else if (userAgentString.includes('iPhone')) {
            os = 'iOS';
        } else if (userAgentString.includes('Android')) {
            os = 'Android';
        }

        log.retrn("parseUserAgent", log.kcarb);
        return {
            browser,
            version,
            os
        };
    } catch (error) {
        log.retrn("parseUserAgent", log.kcarb);
        return {
            browser: 'unknown',
            version: 'unknown',
            os: 'unknown'
        };
    }
  };



// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
