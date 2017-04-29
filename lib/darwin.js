'use strict';

var exec = require('child_process').exec;
var util = require('./util');

var batCommand = 'pmset -g batt';

var batteryStatRegex = /^ -InternalBattery-(\d)+(?:\s+\(id=\d+\))?\s+(\d+)%;.*?((?:(?:not )|(?:dis))?charg(?:ing|ed));.*?(?:(\d+):(\d+)|(?:\(.*\)))/;

/**
 * Callback used by the getChargeStatus function.
 * @callback chargeStatusInformationCollectedCallback
 * @param batteryStats                   {Object} Object containing information about
 *                                                the battery
 * @param batteryStats.powerLevel        {Number} Battery charge in percent
 * @param batteryStats.chargeStatus      {String} Battery status (either charging,
 *                                                discharging, full, or unknown)
 * @param batteryStats.remaining         {Object} Battery time remaining
 * @param batteryStats.remaining.hours   {Number} Hour component of the remaining time
 * @param batteryStats.remaining.minutes {Number} Minute component of the remaining time
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
      var remaining = undefined;
      if (match[4] && match[5]) {
        remaining = {
          hours: parseInt(match[4], 10),
          minutes: parseInt(match[5], 10)
        };
      }
      batInfo.push({
        powerLevel: powerLevel,
        chargeStatus: chargeStatus,
        remaining: remaining
      });
    });
    informationCollectedCb(batInfo);
  });
};
