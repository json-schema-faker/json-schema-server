const { expect } = require('chai');
const cmd = require('./helpers/cmd');

/* global beforeEach, describe, it */

describe('CLI options', () => {
  describe('Invalid directory', () => {
    beforeEach(done => {
      cmd('im_not_exists', done);
    });

    it('should exit with 1', () => {
      expect(cmd.exitStatus).to.eql(1);
    });

    it('should not have stdout', () => {
      expect(cmd.stdout).to.eql('');
    });

    it('should report on stderr', () => {
      expect(cmd.stderr).to.contain('Invalid schema directory');
    });
  });

  describe('Invalid formats', () => {
    beforeEach(done => {
      cmd('-r im_not_exists', done);
    });

    it('should exit with 1', () => {
      expect(cmd.exitStatus).to.eql(1);
    });

    it('should report on stderr', () => {
      expect(cmd.stderr).to.contain('Cannot find module');
    });
  });
});
