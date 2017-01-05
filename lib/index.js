'use strict'

const platformType = require('os').type()

switch (platformType.toLowerCase()) {
  case 'linux':
    module.exports = require('./linux')
    break
  case 'darwin':
    module.exports = require('./darwin')
    break
  default:
    module.exports = require('./default')
}
