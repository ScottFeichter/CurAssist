import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { StackFrame } from '../../../../types/ts-definitions';
import { ResponseDetails } from '../../../../types/ts-definitions';

console.enter();

// #region ====================== START ========================================


export const getResponseDetails = (err: any, responseTimeMs: string, parsedStack: StackFrame[]): ResponseDetails => {
  log.enter("getResponseDetails", log.brack);

  const details = {
    name: err.name,
    title: err.title || 'Error',
    status: err.status || 500,
    message: err.message,
    time: `${responseTimeMs}ms`,
    ...(err.errors && { errors: err.errors }),
    ...(err.cause && { cause: err.cause }),
    trace: parsedStack.map(frame => ({
      function: frame.function,
      location: frame.location
    })),
  };
  
  log.retrn("getResponseDetails", log.kcarb);
  return details;
};



// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
