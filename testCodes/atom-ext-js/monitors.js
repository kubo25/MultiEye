'use babel';

import { WindowRect, Size } from './events';

export default class Monitors {
  static getDesktopSize() {
    return new Size(screen.width, screen.height);
  }

  static getAtomWindowRect() {
    var dimensions = atom.getWindowDimensions(); // not fully used, contains different X and Y if maximized (not 0,0 byt -8,-8)
    // although the position and different size is valid, we do not care about it
    // see https://blogs.msdn.microsoft.com/oldnewthing/20120326-00/?p=8003 for more info
    var w = atom.window;
    return new WindowRect(w.screenX, w.screenY, w.outerWidth, w.innerWidth, w.outerHeight, w.innerHeight, dimensions.maximized);
  }
}
