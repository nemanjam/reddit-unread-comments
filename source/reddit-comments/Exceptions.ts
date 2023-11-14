/**------------------------------------------------------------------------
 *                           My Custom Exceptions
 *------------------------------------------------------------------------**/

/**------------------------------------------------------------------------
 *                           DOM Exceptions
 *------------------------------------------------------------------------**/
export class MyElementNotFoundDOMException extends DOMException {
  constructor(message?: string, name?: string) {
    super(message, name);
  }
}

export class MyElementIdNotValidDOMException extends DOMException {
  constructor(message?: string, name?: string) {
    super(message, name);
  }
}

/**------------------------------------------------------------------------
 *                           Database Exceptions
 *------------------------------------------------------------------------**/

// not needed
export class MyOpenIndexedDBException extends Error {
  constructor(message?: string, name?: string) {
    super(message);
    this.name = 'MyOpenIndexedDBException' ?? name;

    // Ensure the prototype is correctly set
    Object.setPrototypeOf(this, MyOpenIndexedDBException.prototype);
  }
}
