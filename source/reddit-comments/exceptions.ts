/**------------------------------------------------------------------------
 *                           My Custom Exceptions
 *------------------------------------------------------------------------**/

/*--------------------------- Base Exceptions -------------------------*/

class MyBaseDOMException extends DOMException {
  constructor(message?: string, name?: string) {
    super(message, name);

    // Check if captureStackTrace is available (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class MyBaseException extends Error {
  constructor(message?: string, name?: string) {
    super(message);
    this.name = name ?? 'MyBaseError';

    // Check if captureStackTrace is available (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      // Fallback for environments without captureStackTrace
      this.stack = new Error().stack;
    }

    // Ensure the prototype is correctly set
    Object.setPrototypeOf(this, MyBaseException.prototype);
  }
}

/*----------------------------- DOM Exceptions ---------------------------*/

export class MyElementNotFoundDOMException extends MyBaseDOMException {}

export class MyElementIdNotValidDOMException extends MyBaseDOMException {}

/*--------------------------- Database Exceptions -------------------------*/

// not needed
export class MyOpenIndexedDBException extends MyBaseException {}

export class MyCreateModelFailedDBException extends MyBaseException {}

export class MyModelNotFoundDBException extends MyBaseException {}

/*---------------------------- Datetime Exceptions --------------------------*/

export class MyUnparsableDateException extends MyBaseException {}

/*---------------------------- Url Exceptions --------------------------*/

export class MyInvalidRedditThreadUrlException extends MyBaseException {}
