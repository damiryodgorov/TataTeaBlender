/* errorex
 ------------------------
 (c) 2017-present Panates
 This file may be freely distributed under the MIT license.
 For details and documentation:
 https://github.com/panates/errorex
 */

const format = require('util').format;
const path = require('path');
const merge = require('putil-merge');
const StackFrame = require('stackframe');

const STACK_REGEXP = /^\s*at *(.*) \(?(.+):(?:(\d+):(\d+)|(native)|(unknown location))\)?/m;

/**
 * @class ErrorEx
 */
class ErrorEx extends Error {

  /**
   *
   * @param {string|Error} msg
   * @param {...*} args
   * @constructor
   */
  constructor(msg, ...args) {
    if (msg instanceof Error) {
      super();
      this.set(msg);
      this.stack = ErrorEx._mergeStack(msg.stack, this.stack);
    } else
      super(msg && format(msg, ...args));
  }

  /**
   *
   * @return {string}
   */
  get name() {
    return this.constructor === ErrorEx ? 'Error' : this.constructor.name;
  }

  /**
   *
   * @param {Object} [options]
   * @param {boolean} [options.noInternalFiles=false]
   * @param {string} [options.relativeTo]
   * @return {Array|*}
   */
  getStack(options) {
    return ErrorEx.getStack(this, options);
  }

  /**
   *
   * @param {Object} [options]
   * @param {boolean} [options.noInternalFiles=false]
   * @param {string} [options.relativeTo]
   * @return {Array|*}
   */
  getStackFrames(options) {
    /* istanbul ignore else */
    if (!this._stackFrames)
      Object.defineProperty(this, '_stackFrames', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: ErrorEx.parseStack(this.getStack(options))
      });
    return this._stackFrames;
  }

  /**
   * Sets any property to error object and returns error object
   *
   * @param {String} property
   * @param {*} value
   * @return {ErrorEx}
   */
  set(property, value) {
    if (typeof property === 'object') {
      merge(this, property, {
        adjunct: true, descriptor: true,
        filter: (_, n) => !['name', 'stack'].includes(n)
      });
    } else
      this[property] = value;
    return this;
  }

  /**
   *
   * @param {Error} err
   * @param {Object} [options]
   * @param {boolean} [options.noInternalFiles=false]
   * @param {string} [options.relativeTo]
   * @return {Array|*}
   */
  static getStack(err, options) {
    if (!options)
      return err.stack;
    const a1 = err.stack.split(/\n/);
    const result = [];
    for (let line of a1) {
      const m = line.match(/[^(]\(([^:(]*)/) || line.match(/at \(?([^:(]*)/);
      if (m && path.isAbsolute(m[1]) &&
          !m[1].includes(path.sep + 'node_modules')) {
        if (options.relativeTo)
          line = line.replace(m[1], path.relative(options.relativeTo, m[1]));
        result.push(line);
      }
    }
    return result.join('\n');
  }

  /**
   *
   * @param {Object} [options]
   * @param {boolean} [options.noInternalFiles=false]
   * @param {string} [options.relativeTo]
   * @return {Array|*}
   */
  static getCallStack(options) {
    const frames = (new ErrorEx()).getStackFrames(options);
    return frames.map(frame => frame.getFileName());
  }

  static parseStack(stack) {
    const stackArray = stack.split(/\n/);
    const result = [];
    for (const line of stackArray) {
      const m = line.match(STACK_REGEXP);
      if (m)
        result.push(new StackFrame({
          functionName: m[1],
          fileName: m[2],
          lineNumber: m[3],
          columnNumber: m[4],
          isNative: !!m[5],
          source: line
        }));
    }
    return result;
  }

  /**
   *
   * @param {string} org
   * @param {string} ex
   * @return {string}
   * @private
   * @static
   */
  static _mergeStack(org, ex) {
    const a1 = org.split(/\n/);
    const a2 = ex.split(/\n/).filter(line => !!line.match(STACK_REGEXP));
    for (let k = 1; k <= a2.length; k++) {
      if (a2[a2.length - k] !== a1[a1.length - k]) {
        a2.splice(a1.length - k, a2.length);
        break;
      }
    }
    for (let k = 0; k < a1.length; k++) {
      if (a1[k].match(STACK_REGEXP)) {
        a1.splice(k, 0, ...a2);
        return a1.join('\n');
      }
    }
    /* istanbul ignore next */
    return org;
  }
}

/**
 * @class ArgumentError
 */
class ArgumentError extends ErrorEx {
}

/**
 * @class TypeError
 */
class TypeError extends ErrorEx {
}

/**
 * @class RangeError
 */
class RangeError extends ErrorEx {
  /**
   * Sets "minValue" property to error object and returns error object
   * @param {*} value
   * @return {RangeError}
   */
  setMinValue(value) {
    return this.set('minValue', value);
  };

  /**
   * Sets "maxValue" property to error object and returns error object
   * @param {*} value
   * @return {RangeError}
   */
  setMaxValue(value) {
    return this.set('maxValue', value);
  };

}

/**
 * @class ValidateError
 */
class ValidateError extends ErrorEx {
}

/**
 * @class HttpError
 */
class HttpError extends ErrorEx {
  /**
   * Sets "minValue" property to error object and returns error object
   * @param {*} value
   * @return {HttpError}
   */
  setStatus(value) {
    return this.set('status', value);
  };
}

/**
 * @class HttpClientError
 */
class HttpClientError extends HttpError {
  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.setStatus(400);
  }

}

/**
 * @class HttpServerError
 */
class HttpServerError extends HttpError {
  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.setStatus(500);
  }

}

/**
 * Expose module
 */
module.exports = ErrorEx;
Object.assign(ErrorEx, {
  ErrorEx,
  ArgumentError,
  TypeError,
  RangeError,
  HttpError,
  HttpClientError,
  HttpServerError,
  ValidateError
});
