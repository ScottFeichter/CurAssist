import { extendedConsole as console } from '../../../streams/consoles/customConsoles';

console.enter();

// #region ====================== START ========================================


// Define custom log levels
export const customLevels = {
  levels: {
    error: 0,  // Custom "error" level
    warni: 1,  // Custom "warni" level
    infor: 2,  // Custom "infor" level
    https: 3,  // Custom "https" level
    debug: 4,  // Custom "debug" level
    enter: 5,  // Custom "enter" level
    retrn: 6   // Custom "retrn" level
  },
  colors: {
    error: "bold red",
    warni: "yellow",
    infor: "grey",
    https: "green",
    debug: "bold cyan",
    enter: "dim bold magenta",
    retrn: "dim bold magenta"
  },
};


// Add type declaration for the custom levels
declare module 'winston' {
  interface Logger {
      error: LeveledLogMethod;
      warni: LeveledLogMethod;
      infor: LeveledLogMethod;
      https: LeveledLogMethod;
      debug: LeveledLogMethod;
      enter: LeveledLogMethod;
      retrn: LeveledLogMethod;
  }
}


// #endregion ------------------------------------------------------------------

console.leave();;

// #region ====================== NOTES ========================================

//  ABOUT COLORS IN WINSTON

  // Note that not all terminals support all of these styles

  // The actual appearance may vary depending on your terminal configuration

    // Font Colors:

        // black

        // red

        // green

        // yellow

        // blue

        // magenta

        // cyan

        // white

        // gray (or grey)

    // Background Colors (add 'BG' suffix):

        // blackBG

        // redBG

        // greenBG

        // yellowBG

        // blueBG

        // magentaBG

        // cyanBG

        // whiteBG

    // Font Styles:

        // bold

        // dim

        // italic

        // underline

        // inverse

        // hidden

        // strikethrough

// You can combine these using space separation. For example:

    // {
    //   colors: {
    //       error: "bold red",
    //       warn: "italic yellow",
    //       info: "bold cyan",
    //       debug: "green cyanBG"
    //   }
    // }






// #endregion ------------------------------------------------------------------
