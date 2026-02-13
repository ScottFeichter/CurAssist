import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import { log } from '@/utils/logger/logger-setup/logger-wrapper';
import { Request, Response, NextFunction } from 'express';
import { BaseCustomError } from './base-custom-error';

console.enter();

// #region ====================== START ========================================

export const error402_PaymentRequired = (
  err: Error | BaseCustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.enter("error402_PaymentRequired", log.brack);

  const is402Error = (
    // Explicit 402 status
    (err as any).status === 402 ||
    (err as any).statusCode === 402 ||

    // Payment specific errors
    err.name === 'PaymentRequiredError' ||
    err.name === 'SubscriptionError' ||

    // Common payment-related error types
    (err as any).type === 'payment.required' ||
    (err as any).type === 'subscription.expired' ||
    (err as any).code === 'payment_required' ||

    // Subscription or payment status indicators
    (err as any).reason === 'insufficient_funds' ||
    (err as any).reason === 'subscription_expired'
  );

  if (is402Error) {
    if (err instanceof BaseCustomError && err.status === 402) { // If it's already a BaseCustomError with status 402, pass it through
      log.retrn("error402_PaymentRequired", log.kcarb);
      return next(err);
    }

    // Transform to BaseCustomError
    const error = new BaseCustomError("Payment Required", {
      title: "Payment Required",
      status: 402,
      errors: {
        message: err.message || "Payment is required to access this resource",
        type: (err as any).type || 'payment_required',
        code: (err as any).code,
        details: (err as any).details || "This feature requires a paid subscription or payment to access",
        reason: (err as any).reason
      },
      cause: err
    });

    log.retrn("error402_PaymentRequired", log.kcarb);
    return next(error);
  }

  log.retrn("error402_PaymentRequired", log.kcarb);
  return next(err); // Not a 402 error, pass through unchanged
};

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================
/*
  402 Payment Required:
  - Reserved for future use in digital payment systems
  - Commonly used for subscription-based or paid API features
  - Indicates the requested content requires payment
*/
// #endregion ------------------------------------------------------------------
