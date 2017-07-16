'use strict'
/**
 * Uses the capacity and status uevent-files to retrieve battery information. Usually supported on
 * systems using udev as their device manager (i.e. most linux systems). Intended to be used as a
 * fallback from the uevent provider in case the uevent-file doesn't contain all required
 * information.
 */

const { Battery } = require('../battery')

const fs = require('fs')

const batteryBaseDir = '/sys/class/power_supply'
const batteryNameRegex = /^(BAT|CMB)[\d]+/i
const capacityFile = 'capacity'
const statusFile = 'status'

module.exports = {
  name: 'udevFallback',

  checkIsSupported: () => new Promise((resolve, reject) => {
    fs.readdir(batteryBaseDir, (err, files) => {
      if (err) return resolve(false)
      Promise.all(files.map(batteryPath => new Promise(resolve => {
        if (!batteryPath.match(batteryNameRegex)) return resolve(false)
        Promise.all([capacityFile, statusFile].map(file => new Promise(resolve => {
          fs.readFile(`${batteryBaseDir}/${batteryPath}/${file}`, 'utf8', (err, data) => {
            resolve(!err)
          })
        }))).then(results => resolve(results.reduce((a, b) => a && b, true)))
      }))).then(results => resolve(results.reduce((a, b) => a || b, false)))
    })
  }),

  getBatteries: () => new Promise((resolve, reject) => {
    fs.readdir(batteryBaseDir, (err, files) => {
      if (err) return reject(err)
      Promise.all(files.map(batteryPath => new Promise((resolve, reject) => {
        if (!batteryPath.match(batteryNameRegex)) return resolve(null)
        Promise.all([
          new Promise((resolve, reject) => {
            fs.readFile(`${batteryBaseDir}/${batteryPath}/${capacityFile}`, 'utf8', (err, data) => {
              if (err) return reject(err)
              resolve(parseInt(data))
            })
          }),
          new Promise(resolve => {
            fs.readFile(`${batteryBaseDir}/${batteryPath}/${statusFile}`, 'utf8', (err, data) => {
              if (err) return reject(err)
              resolve(data.trim().toLowerCase())
            })
          })
        ]).then(([capacity, status]) => {
          resolve(new Battery(batteryPath, capacity, status))
        }).catch(reject)
      })))
      .then(items => resolve(items.reduce((acc, item) => {
        if (item) acc.push(item)
        return acc
      }, [])))
      .catch(reject)
    })
  })
}
