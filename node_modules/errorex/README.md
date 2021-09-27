# ErrorEx

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

'Extensible Error Class' implementation and predefined additional error types for javascript. 

## Installation

`$ npm install errorex --save`


## Usage

```js
var {ErrorEx, RangeError} = require('errorex');

var error = new erx.RangeError('Value out of range')
        .setMinValue(1)
        .setMaxValue(5);
console.log(error.message);                    // Value out of range
console.log(error instanceof Error);           // true
console.log(error instanceof erx.RangeError);  // true
console.log(error.toString());                 // RangeError: Value out of range
console.log(error.minValue);                   // 1
console.log(error.maxValue);                   // 5
console.log(error.stack);                      // Prints stack trace
```

## Extending custom error classes in ES6
```js
class MyError extends ErrorEx {
 constructor(...args) {
   super(...args);
   this.myproperty = 1000;
 }
 
 setFoo(val) {
   this.set('foo', val);
 }
}


throw new MyError('My message %d', 10)
.setFoo('fooooo')
.set({
  prop1: 1,
  prop2: 2
});
```

## Extending custom error classes in ES5
```js

function MyError() {
  ErrorEx.apply(this, arguments);
  this.myproperty = 1000;
}
MyError.prototype = Object.create(ErrorEx.prototype);
MyError.prototype.constructor = MyError;
MyError.prototype.setFoo = function(val) {
  this.set('foo', val);
};


throw new MyError('My message %d', 10).setFoo('fooooo');
```

## Predefined error classes

- ErrorEx: Base error class
  
- ArgumentError: Extending from ErrorEx  

- RangeError: Extending from ErrorEx

- HttpError: Extending from ErrorEx

- HttpClientError: Extending from HttpError
 
- HttpServerError: Extending from HttpError
  

## Node Compatibility

  - node `>= 0.10`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/errorex.svg
[npm-url]: https://npmjs.org/package/errorex
[travis-image]: https://img.shields.io/travis/panates/errorex/master.svg
[travis-url]: https://travis-ci.org/panates/errorex
[coveralls-image]: https://img.shields.io/coveralls/panates/errorex/master.svg
[coveralls-url]: https://coveralls.io/r/panates/errorex
[downloads-image]: https://img.shields.io/npm/dm/errorex.svg
[downloads-url]: https://npmjs.org/package/errorex
[gitter-image]: https://badges.gitter.im/panates/errorex.svg
[gitter-url]: https://gitter.im/panates/errorex?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/panates/errorex/status.svg
[dependencies-url]:https://david-dm.org/panates/errorex
[devdependencies-image]: https://david-dm.org/panates/errorex/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/errorex?type=dev
[quality-image]: http://npm.packagequality.com/shield/errorex.png
[quality-url]: http://packagequality.com/#?package=errorex
