import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import morgan from 'morgan';
import logger from '../logger';

console.enter();

// #region ====================== START ========================================


// Create a stream object with a write function that will be used by Morgan
export const morganStream = {
  write: (message: string) => {
      logger.https(message.trim());
  }
};

export const morganMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream }
);



// #endregion ------------------------------------------------------------------


console.leave();;


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
