

// // transports

// // Error logs - only error level
// new winston.transports.File({
//   filename: path.join(logPaths.error, 'error.log'),
//   level: 'error',
//   format: winston.format.combine(
//       winston.format.printf(info =>
//           info.level === 'error' ? `${info.timestamp} ${info.level}: ${info.message}` : ''
//       )
//   )
// }),

// // Warning logs - only warni level
// new winston.transports.File({
//   filename: path.join(logPaths.warni, 'warni.log'),
//   level: 'warni',
//   format: winston.format.combine(
//       winston.format.printf(info =>
//           info.level === 'warni' ? `${info.timestamp} ${info.level}: ${info.message}` : ''
//       )
//   )
// }),
// // Info logs - only infor level
// new winston.transports.File({
//   filename: path.join(logPaths.infor, 'info.log'),
//   level: 'infor',
//   format: winston.format.combine(
//       winston.format.printf(info =>
//           info.level === 'infor' ? `${info.timestamp} ${info.level}: ${info.message}` : ''
//       )
//   )
// }),
// // Https logs - only https level
// new winston.transports.File({
//   filename: path.join(logPaths.https, 'https.log'),
//   level: 'https',
//   format: winston.format.combine(
//       winston.format.printf(info =>
//           info.level === 'https' ? `${info.timestamp} ${info.level}: ${info.message}` : ''
//       )
//   )
// }),
// // Debug logs - only debug level
// new winston.transports.File({
//   filename: path.join(logPaths.debug, 'debug.log'),
//   level: 'debug',
//   format: winston.format.combine(
//       winston.format.printf(info =>
//           info.level === 'debug' ? `${info.timestamp} ${info.level}: ${info.message}` : ''
//       )
//   )
// }),
// // Enter logs - only enter level
// new winston.transports.File({
//   filename: path.join(logPaths.enter, 'enter.log'),
//   level: 'enter',
//   format: winston.format.combine(
//       winston.format.printf(info =>
//           info.level === 'enter' ? `${info.timestamp} ${info.level}: ${info.message}` : ''
//       )
//   )
// }),
// // Retrn logs - only retrn level
// new winston.transports.File({
//   filename: path.join(logPaths.retrn, 'retrn.log'),
//   level: 'retrn',
//   format: winston.format.combine(
//       winston.format.printf(info =>
//           info.level === 'retrn' ? `${info.timestamp} ${info.level}: ${info.message}` : ''
//       )
//   )
// }),
