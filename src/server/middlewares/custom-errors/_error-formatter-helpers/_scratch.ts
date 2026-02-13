//  export const parseStack = (stack: string) => {
//     log.enter("parseStack", log.brack);
//     if (!stack) return [];

//     console.super("stack", stack);

//     return stack
//       .split('\n')
//       .map(line => line.trim())
//       .filter(line =>
//         line.startsWith('at ') &&
//         !line.includes('node_modules') && // Exclude node_modules
//         !line.includes('node:events:') && // Exlude node:events
//         !line.includes('node:domain:') // Exlude node:domain
//       )
//       .map(line => {
//         const [, functionName = 'anonymous', location = ''] =
//           line.match(/at (?:(.+?)\s+\()?(.+?)(?:\))?$/) || [];

//         // Clean up the location
//         const cleanLocation = location
//           .replace(process.cwd(), '')  // Remove absolute path
//           .replace(/^\//, '')          // Remove leading slash
//           .replace(/\\/g, '/');        // Convert Windows paths to forward slashes


//         log.retrn("parseStack", log.kcarb);
//         return {
//           function: functionName,
//           location: cleanLocation,
//           fullLine: line
//         };
//       });
//   };
