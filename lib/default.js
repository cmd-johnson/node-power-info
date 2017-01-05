'use strict'

const util = require('./util')

module.exports.getChargeStatus = informationCollectedCb => {
  util.logError('Your current platform doesn\'t seem to be supported at the moment')
  informationCollectedCb([])
}
