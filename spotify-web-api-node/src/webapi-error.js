'use strict';

function WebapiError(message, statusCode, path, method) {
  this.name = 'WebapiError';
  this.message = message || '';
  this.statusCode = statusCode;
  this.path = path;
  this.method = method;
}

WebapiError.prototype = Error.prototype;

module.exports = WebapiError;
