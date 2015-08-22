'use strict';

var exec = require('child_process').exec;
var util = require('./util');

var batCommand = 'pmset -g batt';

var batteryStatRegex = /^ -InternalBattery-(\d)+\s+(\d+)%;.*?((?:(?:not )|(?:dis))?charging)/;

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
      util.logError('executing the commant ' + batCommand + ' produced error output', stderr);
    }
    // parse the output line for line, looking for battery informationCollectedCb
    var batInfo = [];
    stdout.split('\n').forEach(function(line) {
      var match = batteryStatRegex.exec(line);
      if (!match) {
        return;
      }
      // var batteryId = match[1]; // we don't need this at the moment
      var powerLevel = match[2];
      var chargeStatus = 'unknown';
      switch (match[3]) {
        case 'charging':
          chargeStatus = 'charging';
          break;
        case 'not charging':
        case 'discharging':
          chargeStatus = 'discharging';
          break;
      }
      batInfo.push({
        powerLevel: powerLevel,
        chargeStatus: chargeStatus
      });
    });
    informationCollectedCb(batInfo);
  });
};