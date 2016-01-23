'use strict';

module.exports = {

  port: 3000,

  fakeroot: 'http://json-schema.org',

  CORSHeaders: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Content-Length',
    'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range'
  },

  schemaExtensions: [
    '',
    '.json',
    '.schema',
    '-schema.json'
  ],

  HTTPStatus: {
    InternalServerError: 500,
    NotFound: 404
  }
};
