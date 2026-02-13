the entry file is entry.ts

but as we know it first looks up before looking down

in other words, it compiles the imports first

before entering it's own code blocks

so here is the actual order that things run

we will only show for the startup sequence

because after the app is established and running the order varies depending

*indicates not called again because already called

sequence:

====FILE ENTRY.TS=========================================================================

----import level 1 -------
env-module.ts via entry.ts


----import level 2 -------
logger-paths.ts via logger-directories.ts via entry.ts
logger-clearpath.ts via logger-directories.ts via entry.ts
logger-directories.ts via entry.ts



----import level 3 -------
logger-formatters.ts via logger.ts via logger-trials.ts via entry.ts
logger-levels.ts via logger.ts via logger-trials.ts via entry.ts
*logger-paths.ts via logger.ts via logger-trials.ts via entry.ts
logger-timestamp.ts via logger.ts via logger-trials.ts via entry.ts
logger.ts via logger-trials.ts via entry.ts

*logger-formatters via logger.ts via logger-wrapper.ts via logger-trials.ts via entry.ts
*logger-levels.ts via logger.ts via logger-wrapper.ts via logger-trials.ts via entry.ts
*logger-paths.ts via logger.ts via logger-wrapper.ts via logger-trials.ts via entry.ts
*logger-timestamp.ts via logger.ts via logger-wrapper.ts via logger-trials.ts via entry.ts
*logger.ts via logger-wrapper.ts via logger-trials.ts via entry.ts
logger-wrapper.ts via logger-trials.ts via entry.ts
logger-trials.ts via entry.ts

----code region ENTER ----------

(entring entry.ts...)

----code region START ----------

console.assert to use requiredEvnVars so as to enter env.module first

(call:
    createLogDirectories()
    testLoggers()
    testLoginWrappers()
)




----import level 4 -------


logger-morganMiddleware.ts via setupMiddleware.ts via server.ts 






----code region EXITO ----------
