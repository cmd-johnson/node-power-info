'use strict';

var util = require('./util');

module.exports.getChargeStatus = function(informationCollectedCb) {
  util.logError('Your current platform doesn\'t seem to be supported at the moment');
  informationCollectedCb([]);
};
