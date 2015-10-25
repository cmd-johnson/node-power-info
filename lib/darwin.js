'use strict';

var exec = require('child_process').exec;
var util = require('./util');

var batCommand = 'pmset -g batt';

var batteryStatRegex = /^ -InternalBattery-(\d)+\s+(\d+)%;.*?((?:(?:not )|(?:dis))?charg(?:ing|ed))/;

/**
 * Callback used by the getChargeStatus function.
 * @callback chargeStatusInformationCollectedCallback
 * @param batteryStats              {Object} Object containing information about
 *                                           the battery
 * @param batteryStats.powerLevel   {Number} Battery charge in percent
 * @param batteryStats.chargeStatus {String} Battery status (either charging,
 *                                           discharging, full, or unknown)
 */
/**
 * Checks the charge in percent, as well as the power status for all installed
 * batteries.
 *
 * @param {chargeStatusInformationCollectedCallback} informationCollectedCb
 *        called when battery information were collected
 */
module.exports.getChargeStatus = function(informationCollectedCb) {
  exec(batCommand, function(error, stdout, stderr) {
    if (error) {
      util.logError('error executing the command ' + batCommand, error);
      return informationCollectedCb(error);
    }
    if (stderr) {
      util.logError('executing the command ' + batCommand + ' produced error output', stderr);
    }
    // parse the output line for line, looking for battery information
    var batInfo = [];
    stdout.split('\n').forEach(function(line) {
      var match = batteryStatRegex.exec(line);
      if (!match) {
        return;
      }
      // var batteryId = match[1]; // we don't need this at the moment
      var powerLevel = parseInt(match[2], 10);
      var chargeStatus = util.validateChargeStatus(match[3]);
      batInfo.push({
        powerLevel: powerLevel,
        chargeStatus: chargeStatus
      });
    });
    informationCollectedCb(batInfo);
  });
};
