

// Attach Chai APIs to global scope
const { expect, should, assert } = require('chai');
global.expect = expect;
global.should = should;
global.assert = assert;

// Require all JS files in `./specs` for Mocha to consume
require('require-dir')('./models');
