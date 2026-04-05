// Set NODE_ENV before any modules load
process.env.NODE_ENV = 'test';

// Suppress console output during tests
// The custom extendedConsole uses these under the hood
global.console.log   = jest.fn();
global.console.info  = jest.fn();
global.console.warn  = jest.fn();
global.console.error = jest.fn();
global.console.debug = jest.fn();
