const { expect } = require('chai');
const server = require('../lib/server');
const fetch = require('./helpers/fetch');

/* global beforeEach, afterEach, describe, it */

describe('Server', () => {
  let hasError = null;

  beforeEach(done => {
    server.start({
      port: 9002,
      silent: true,
      directory: `${__dirname}/fixtures`,
    }, err => {
      hasError = err;
      done();
    });
  });

  afterEach(() => {
    server.closeApp(() => {});
  });

  describe('starting up', () => {
    it('should start without errors', () => {
      expect(hasError).toBeUndefined();
    });
  });

  describe('making requests', () => {
    it('should responds to / with a list of found schemas', done => {
      fetch('http://localhost:9002/', (err, response) => {
        const schemas = ['email.schema', 'id-schema.json', 'user.json', 'users.json'];

        expect(response.status).toBe(200);
        expect(response.json).toEqual(schemas);
        done();
      });
    });
    it('should responds 404 un missing schemas', done => {
      fetch('http://localhost:9002/im_not_exists', (err, response) => {
        expect(response.json.error).toMatch(/File.*im_not_exists.*not found/);
        expect(response.status).toBe(404);
        done();
      });
    });
  });
});
