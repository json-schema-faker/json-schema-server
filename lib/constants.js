'use strict';

module.exports = {

  port: 3000,

  fakeroot: 'http://json-schema.org',

  schemaExtensions: [
    '',
    '.json',
    '.schema',
    '-schema.json',
  ],

  HTTPStatus: {
    InternalServerError: 500,
    NotFound: 404,
    OK: 200,
  },
};
