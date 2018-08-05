'use strict'

/**
 * Represents a single battery.
 */
class Battery {
  /**
   * Creates a new Battery object.
   *
   * @param {string} id                   The id of the battery as provided by the OS.
   * @param {number} powerLevel           The power level of the battery in percent
   * @param {String} chargeStatus         The battery's status. Either 'charging', 'discharging',
   *                                      'full' or 'unknown'
   * @param {number} [remainingTime=null] The estimated remaining (dis-)charge time in minutes
   */
  constructor (id, powerLevel, chargeStatus, remainingTime = null) {
    this.id = id
    this.powerLevel = powerLevel
    this.remainingTime = typeof remainingTime === 'number' && isFinite(remainingTime)
      ? remainingTime
      : null

    switch (chargeStatus) {
      case 'charging':
      case 'discharging':
      case 'full':
        this.chargeStatus = chargeStatus
        break
      default:
        this.chargeStatus = 'unknown'
    }
  }

  /**
   * True if a remaining time was set.
   */
  get isTimeAvailable () {
    return typeof this.remainingTime === 'number'
  }

  /**
   * The remaining (dis-)charge time in whole hours, rounded down.
   *
   * Is null if `isTimeAvailable` is `false`.
   */
  get remainingTimeHours () {
    return this.isTimeAvailable ? Math.floor(this.remainingTime / 60) : null
  }

  /**
   * The remaining (dis-)charge time in minutes after subtracting the remaining hours, rounded down.
   *
   * Is null if `isTimeAvailable` is `false`.
   */
  get remainingTimeMinutes () {
    return this.isTimeAvailable ? Math.floor(this.remainingTime % 60) : null
  }
}

module.exports = { Battery }
