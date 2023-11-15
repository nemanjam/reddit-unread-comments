/**------------------------------------------------------------------------
 *                           My Custom Exceptions
 *------------------------------------------------------------------------**/

/*--------------------------- Base Exceptions -------------------------*/

class MyBaseDOMException extends DOMException {
  constructor(message?: string, name?: string) {
    super(message, name);
  }
}

class MyBaseException extends Error {
  constructor(message?: string, name?: string) {
    super(message);
    this.name = name ?? 'MyBaseError';

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
