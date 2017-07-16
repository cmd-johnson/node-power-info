'use strict'
/**
 * Uses the uevent file to retrieve battery information. Usually supported on systems using udev as
 * their device manager (i.e. most linux systems).
 */

const { Battery } = require('../battery')

const fs = require('fs')

const batteryBaseDir = '/sys/class/power_supply'
const batteryNameRegex = /^(BAT|CMB)[\d]+/i
const ueventFile = 'uevent'

const chargeStatusRegex = /POWER_SUPPLY_STATUS=([^\n]+)/
const batteryLevelRegex = /POWER_SUPPLY_CAPACITY=(\d{1,3})/
const currentPowerRegex = /POWER_SUPPLY_POWER_NOW=(\d+)/
const energyFullRegex = /POWER_SUPPLY_ENERGY_FULL=(\d+)/
const energyNowRegex = /POWER_SUPPLY_ENERGY_NOW=(\d+)/

module.exports = {
  name: 'uevent',

  checkIsSupported: () => new Promise((resolve, reject) => {
    fs.readdir(batteryBaseDir, (err, files) => {
      if (err) return resolve(false)
      Promise.all(files.map(file => new Promise(resolve => {
        if (!file.match(batteryNameRegex)) return resolve(false)
        fs.readFile(`${batteryBaseDir}/${file}/${ueventFile}`, 'utf8', (err, data) => {
          if (err) return resolve(false)
          // At least charge status and battery level need to be present.
          return resolve(!!(data.match(chargeStatusRegex) && data.match(batteryLevelRegex)))
        })
      }))).then(results => resolve(results.reduce((a, b) => a || b, false)))
    })
  }),

  getBatteries: () => new Promise((resolve, reject) => {
    fs.readdir(batteryBaseDir, (err, files) => {
      if (err) return reject(err)
      Promise.all(files.map(batteryPath => new Promise((resolve, reject) => {
        if (!batteryPath.match(batteryNameRegex)) return resolve(null)
        fs.readFile(`${batteryBaseDir}/${batteryPath}/${ueventFile}`, 'utf8', (err, data) => {
          if (err) return reject(err)

          // Make sure status and level are available
          const status = data.match(chargeStatusRegex)
          const level = data.match(batteryLevelRegex)
          if (!status || !level) return resolve(null)

          let remainingTime = null
          const currentPower = data.match(currentPowerRegex)
          const energyFull = data.match(energyFullRegex)
          const energyNow = data.match(energyNowRegex)
          if (currentPower && energyFull && energyNow) {
            if (status[0].toLowerCase() === 'charging') {
              console.log(parseInt(energyFull[1]), parseInt(energyNow[1]), parseInt(currentPower[1]))
              const remainingTimeH = (parseInt(energyFull[1]) - parseInt(energyNow[1])) / parseInt(currentPower[1])
              remainingTime = remainingTimeH * 60
            } else {
              const remainingTimeH = parseInt(energyNow[1]) / parseInt(currentPower[1])
              remainingTime = remainingTimeH * 60
            }
          }

          resolve(new Battery(
            batteryPath,
            parseInt(level[1]),
            status[1].toLowerCase(),
            remainingTime
          ))
        })
      })))
      .then(items => resolve(items.reduce((acc, item) => {
        if (item) acc.push(item)
        return acc
      }, [])))
      .catch(reject)
    })
  })
}
