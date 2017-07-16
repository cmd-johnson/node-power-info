'use strict'
/*
 * Uses pmset to retrieve information on the charge status of batteries. Usually supported on
 * darwin systems (i.e. macOS).
 */

const { Battery } = require('../battery')
const { exec } = require('child_process')

const command = 'pmset -g batt'
const batteryStatRegex = /^ -(InternalBattery-\d+)(?:\s+\(id=\d+\))?\s+(\d+)%;.*?((?:(?:not )|(?:dis))?charg(?:ing|ed));.*?(?:(\d+):(\d+)|(?:\(.*\)))/

function normalizeStatus (status) {
  switch (status) {
    case 'discharging':
    case 'charging':
      return status
    case 'charged':
      return 'full'
    default:
      return 'unknown'
  }
}

module.exports = {
  name: 'pmset',

  checkIsSupported: () => new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err || stderr) return resolve(false)
      resolve(true)
    })
  }),

  getBatteries: () => new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) return reject(`Error executing '${command}': ${err}`)
      if (stderr) return reject(`Executing '${command}' produced error output: '${stderr}'`)
      const batteries = []
      stdout.split('\n').forEach(line => {
        const match = line.match(batteryStatRegex)
        if (!match) return
        const [, batteryId, level, status, hours, minutes] = match
        const timeRemaining = hours && minutes
          ? parseInt(hours) * 60 + parseInt(minutes)
          : null
        try {
          batteries.push(new Battery(
            batteryId,
            parseInt(level),
            normalizeStatus(status),
            timeRemaining
          ))
        } catch (e) {
          reject(e)
        }
      })
      resolve(batteries)
    })
  })
}
