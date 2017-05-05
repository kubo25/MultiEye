'use babel';

export class Helpers {
  static checkOwnPropertiesEqual(first, second) {
    for (name in first) {
      if (second.hasOwnProperty(name) === false
          || first[name] !== second[name]) {
          return false;
      }
    }
    return true;
  }
}


export class WindowUpdatedEvent {
  constructor(windowRect) {
    this.Name = "WindowUpdated";
    this.TimeStamp = new Date();
    this.Data = windowRect; // WindowRect
  }

  toString() {
    return this.Name + " "
         + "(" + this.Data.x + "," + this.Data.y + ") "
         + "[" + this.Data.outerWidth + "x" + this.Data.outerHeight + "]";
  }
}


export class Size {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  toString() {
    return "[" + this.width + "x" + this.height + "]";
  }

  equals(other) {
    return other
        && Helpers.checkOwnPropertiesEqual(this, other);
  }
}


export class WindowRect {
  constructor(screenX, screenY, outerWidth, innerWidth, outerHeight, innerHeight, isMaximized) {
    this.x = screenX;
    this.y = screenY;
    this.outerWidth = outerWidth;
    this.innerWidth = innerWidth;
    this.outerHeight = outerHeight;
    this.innerHeight = innerHeight;
    this.isMaximized = isMaximized;
  }

  equals(other) {
    return other
        && Helpers.checkOwnPropertiesEqual(this, other);
  }
}


export class EditorOpenEvent {
  constructor(editorId, editorTitle, documentPath, documentContents) {
    // add editor.getApproximageScreenLineCount() + editor.getLineCount()
    this.Name = "EditorOpen";
    this.TimeStamp = new Date();
    this.Data = {
      editor: editorId,
      title: editorTitle,
      path: documentPath,
      contents: documentContents
    };
  }

  toString() {
    return this.Name + " "
         + this.Data.editor + " " + this.Data.title;
  }
}


export class EditorSwitchToEvent {
  constructor(editorId, documentPath) {
    this.Name = "EditorSwitchTo";
    this.TimeStamp = new Date();
    this.Data = { editor: editorId, path: documentPath };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}


export class BoundingRect {
  constructor(left, top, right, bottom, width, height) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.width = width;
    this.height = height;
  }

  static create(boundingRect) {
    if (boundingRect) {
      return new BoundingRect(
        boundingRect.left,
        boundingRect.top,
        boundingRect.right,
        boundingRect.bottom,
        boundingRect.width,
        boundingRect.height
      );
    }
    else {
      return new BoundingRect(0,0,0,0,0,0);
    }
  }

  equals(other) {
    return other
        && Helpers.checkOwnPropertiesEqual(this, other);
  }

  toString() {
    return "(" + this.left + "," + this.top + ") "
         + "[" + this.width + "x" + this.height + "]";
  }
}


export class EditorResizedEvent {
  constructor(editorId, documentPath, size) {
    this.Name = "EditorResized";
    this.TimeStamp = new Date();
    this.Data = {
      editor: editorId,
      path: documentPath,
      size: BoundingRect.create(size)
    };
  }

  toString() {
    return this.Name + " " + this.Data.editor + ": " + this.Data.size.toString();
  }
}


export class EditorTextLayoutChangedEvent {
  constructor(editorId, documentPath, defaultCharWidth, doubleWidthCharWidth, lineHeight, showsLineNumbers, lineNumberGutterRect) {
    this.Name = "EditorTextLayoutChanged";
    this.TimeStamp = new Date();
    this.Data = {
        editor: editorId,
        path: documentPath,
        defaultCharWidth: defaultCharWidth,
        doubleWidthCharWidth: doubleWidthCharWidth,
        lineHeight: lineHeight,
        showsLineNumbers: showsLineNumbers,
        // scrollLeft: scrollLeft,
        // scrollTop: scrollTop,
        lineNumberGutterRect: lineNumberGutterRect
    };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}

// editor.logScreenLines() -> line and screenLine number + line for the whole document

// activeEditorResized
// editorContentChanged
// windowUpdated
// aliveEditors
// editorSwitches
// - editorTextLayoutChanged
export class EditorContentLayoutChangedEvent {
  constructor(editorId, documentPath, lineCount, rows, columns, rowsPerPage, isWrapped, wrapColumn) {
    this.Name = "EditorContentLayoutChanged";
    this.TimeStamp = new Date();
    this.Data = {
      editor: editorId,
      path: documentPath,
      lineCount: lineCount, // int
      rows: rows, // int
      columns: columns, // column, row
      rowsPerPage: rowsPerPage,
      isWrapped: isWrapped,
      wrapColumn: wrapColumn
    };
  }

  toString() {
    return this.Name + " " + this.Data.editor + ": " + this.Data.lineCount + " (" + this.Data.rows + ")"
  }
}


export class EditorScrollChangedEvent {
  constructor(editorId, scrollLeft, scrollTop) {
    this.Name = "EditorScrollChanged";
    this.TimeStamp = new Date();
    this.Data = {
      editor: editorId,
      scrollLeft: scrollLeft,
      scrollTop: scrollTop,
      // ed.getHorizontalScrollMargin()
      // horizontalScrollHeight: horizontalScrollHeight,
      // verticalScrollWidth: verticalScrollWidth,
    };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}


export class EditorContentChangedEvent {
  constructor(editorId, documentPath, change) {
    this.Name = "EditorContentChanged";
    this.TimeStamp = new Date();
    this.Data = { editor: editorId, path: documentPath, change: change };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}


export class CursorPositionChangedEvent {
  constructor(editorId, documentPath, position) {
    this.Name = "CursorPositionChanged";
    this.TimeStamp = new Date();
    this.Data = { editor: editorId, path: documentPath, position : position };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}


export class SelectionChangedEvent {
  constructor(editorId, documentPath, range) {
    this.Name = "SelectionChanged";
    this.TimeStamp = new Date();
    this.Data = {
      editor: editorId,
      path: documentPath,
      selectionStart: {
        row: range.start.row,
        column: range.start.column
      },
      selectionEnd: {
        row: range.end.row,
        column: range.end.column
      }
    };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}


export class EditorClosedEvent {
  constructor(editorId, documentPath) {
    this.Name = "EditorClosed";
    this.TimeStamp = new Date();
    this.Data = {
      editor: editorId,
      path: documentPath
    };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}


export class DocumentSavedEvent {
  constructor(editorId, documentPath) {
    this.Name = "DocumentSaved";
    this.TimeStamp = new Date();
    this.Data = {
      editor: editorId,
      path: documentPath
    };
  }

  toString() {
    return this.Name + " " + this.Data.editor;
  }
}


export class DesktopSizeChangedEvent {
  constructor(size) {
    this.Name = "DesktopSizeChanged";
    this.TimeStamp = new Date();
    this.Data = size; // Size
  }

  toString() {
    return this.Name + " " + this.Data.toString();
  }
}
