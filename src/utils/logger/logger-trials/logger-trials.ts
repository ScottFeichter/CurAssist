// #region ===================== IMPORTS =======================================
import path from 'path';
import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import logger from "../logger";
import { log } from "../logger-setup/logger-wrapper";
// #endregion ------------------------------------------------------------------


console.enter();


// #region ====================== START ========================================



//===================== TEST CUSTOM WINSTON LOGGERS ============================


export const testLoggers = () => {
  log.enter("testLoggers()", log.brack);

  logger.error('This is a test of the error logger');
  logger.warni('This is a test of the warni logger');
  logger.infor('This is a test of the infor logger');
  logger.https('This is a test of the https logger');
  logger.debug('This is a test of the debug logger');
  logger.enter('This is a test of the enter logger');
  logger.retrn('This is a test of the retrn logger');

  return log.retrn("testLoggers()", log.kcarb);
};


//===================== TEST CUSTOM LOG WRAPPERS ===============================
export const testLogWrappers = () => {
  log.enter("testLogWrappers()", log.brack);


//--------------- SINGLE ARG TESTS FOR EACH LOG WRAPPER ------------------------

log.error("This is a single arg test for log error wrapper");
log.warni("This is a single arg test for log warni wrapper");
log.infor("This is a single arg test for log infor wrapper");
log.https("This is a single arg test for log https wrapper");
log.debug("This is a single arg test for log debug wrapper");
log.enter("This is a single arg test for log enter wrapper");
log.retrn("This is a single arg test for log retrn wrapper");


//-------------------- TEST HELPER VARIABLES -----------------------------------


  // let objVar = { x: 1, y: 2 };
  // let arrVar = [4, 5, 6];

  // let someStringVariable = "I am someStringVariable resolved!";
  // let someInterpolatedStringVariable = "interpolated!";

  // let someNumberVariable = 69;
  // let someInterpolatedNumberVariable = 69;

  // let someBooleanVariable = false;
  // let someInterpolatedBooleanVariable = true;

  // let someObject = { someObject: true };
  // let someInterpolatedObject = { someInterpoatedObject: true };

  // let someArray = [ "someArray", "someArray", "someArray" ];
  // let someInterpoatedArray = ["someInterpolatedArray", "someInterpolatedArray"];


//================== MUTLI ARG TESTS FOR EACH LOG WRAPPER ======================

  // log.error("Test error log wrapper multiple args", objVar, arrVar);

  // log.warni('Testing warni log wrapper for multiple args:',
  //   { someData: 123 },
  //     'second arg',
  //     someStringVariable,
  //     `I am someInterpolatedStringVariable ${someInterpolatedStringVariable}`
  //   );

  // log.infor('Testing infor log wrapper for multiple args:',
  //   { someData: 123 },
  //     'second arg',
  //     someStringVariable,
  //     `I am someInterpolatedStringVariable ${someInterpolatedStringVariable}`
  //   );

  // log.https('Testing https log wrapper for multiple args:',
  //   { someData: 123 },
  //     'second arg',
  //     someStringVariable,
  //     `I am someInterpolatedStringVariable ${someInterpolatedStringVariable}`
  //   );

  // log.debug('Testing debug log wrapper for multiple args:',
  //   { someData: 123 },
  //     'second arg',
  //     someStringVariable,
  //     `I am someInterpolatedStringVariable ${someInterpolatedStringVariable}`
  //   );

  log.retrn(`testLogWrappers()`, log.kcarb);
}

// #endregion ------------------------------------------------------------------


console.leave();



// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
