'use strict'

/* The first supported provider out of this list will be chosen as the default provider. */
module.exports = [
  require('./pmset'),
  require('./uevent'),
  require('./udev-fallback'),
  require('./navigator')
]
