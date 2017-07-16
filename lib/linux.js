'use strict'

const async = require('async')
const fs = require('fs')
const path = require('path')
const util = require('./util')

// the path where battery information can be read from
const batBasePath = '/sys/class/power_supply'

// the file containing the battery charge in percent
const batCapacityPath = 'capacity'
// the file containing the charge status of the battery
// (may contain one of the following: charging, full, discharging, unknown)
const batStatusPath = 'status'

// options used when reading the status files
const fileOpenOptions = {
  encoding: 'utf8',
  flag: 'r'
}

/**
 * Callback used by readFile function.
 * @callback fileReadCallback
 * @param {Object|null}   error If an error occurred reading the file, this
 *                              parameter will be set to that error, otherwise
 *                              it is set to null.
 * @param {String} fileContents The contents read from the statFile, if no error
 *                              occurred.
 */
/**
 * Reads a battery stat file relative to the batBasePath. The path is built as
 * follows: `batBasePath/relativeBatPath/batStatPath`.
 *
 * @param {String} relativeBatPath  The path to the battery to check, relative
 *                                  to the batBasePath
 * @param {String} batStatPath      The filename of the stat to read for the
 *                                  given battery
 * @param {fileReadCallback} fileReadCallback called when the file was read or
 *                                            an error occurred.
 */
function readFile (relativeBatPath, batStatPath, fileReadCallback) {
  const absStatPath = path.join(batBasePath, relativeBatPath, batStatPath)
  fs.readFile(absStatPath, fileOpenOptions, (err, data) => {
    if (err) {
      return fileReadCallback(err)
    }
    fileReadCallback(null, data)
  })
}

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
module.exports.getChargeStatus = function getChargeStatus (informationCollectedCb) {
  util.findSubdirectories(batBasePath, powerSupplyPaths => {
    let batStats = []

    async.each(powerSupplyPaths, function (batPath, statusCheckedCallback) {
      if (!batPath.match(/^(BAT|CMB)[\d]+/i)) {
        return statusCheckedCallback()
      }

      let batteryInfo = {}
      async.series([
        function getPowerLevel (powerLevelCkeckedCb) {
          readFile(batPath, batCapacityPath, (err, data) => {
            if (err) {
              util.logError('error reading power level', err)
              return powerLevelCkeckedCb(err)
            }
            try {
              batteryInfo.powerLevel = parseInt(data, 10)
              powerLevelCkeckedCb()
            } catch (e) {
              powerLevelCkeckedCb(e)
            }
          })
        },
        function getChargeMode (chargeModeCheckedCb) {
          readFile(batPath, batStatusPath, (err, data) => {
            if (err) {
              util.logError('error reading charge status', err)
              return chargeModeCheckedCb(err)
            }
            batteryInfo.chargeStatus = data.toLowerCase().trim()
            chargeModeCheckedCb()
          })
        }
      ], () => {
        batStats.push(batteryInfo)
        statusCheckedCallback()
      })
    }, (err) => {
      if (err) {
        util.logError('error while fetching battery status', err)
      }
      informationCollectedCb(batStats)
    })
  })
}
