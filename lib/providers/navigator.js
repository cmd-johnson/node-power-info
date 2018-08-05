'use strict'
/**
 * Uses the Battery Status API (https://w3c.github.io/battery/) to retrieve battery information.
 * Supported in Chrome, some older versions of Firefox and Electron.
 */

const { Battery } = require('../battery')

const fs = require('fs')

function isBatteryManager (obj) {
  return [
    'charging',
    'chargingTime',
    'dischargingTime',
    'level',
    'onchargingchange',
    'onchargingtimechange',
    'ondischargingtimechange',
    'onlevelchange'
  ].reduce((result, prop) => result && prop in obj, true)
}

module.exports = {
  name: 'navigator',

  checkIsSupported: () => new Promise((resolve, reject) => {
    try {
      navigator.getBattery()
        .then(batteryManager => resolve(isBatteryManager(batteryManager)))
        .catch(() => resolve(false))
    } catch (e) {
      resolve(false)
    }
  }),

  getBatteries: () => navigator.getBattery().then(battery => [new Battery(
    'battery',
    battery.level * 100,
    battery.charging ? 'charging' : 'discharging',
    (battery.charging ? battery.chargingTime : battery.dischargingTime) / 60
  )])
}
