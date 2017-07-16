'use strict'

const providers = require('./providers')

let setSupportedProviders = null
const supportedProvidersAvailable = new Promise(resolve => { setSupportedProviders = resolve })
const getSupportedProviders = () => supportedProvidersAvailable

// Find supported providers
Promise.all(providers.map(provider => provider.checkIsSupported()))
  .then(supported => supported.map((s, i) => [s, i]))
  .then(supported => supported.filter(([s, i]) => s))
  .then(supported => supported.map(([s, i]) => providers[i]))
  .then(setSupportedProviders)

// Default provider is the first supported provider
const getDefault = () => getSupportedProviders()
  .then(providers => {
    if (providers.length > 0) return providers[0]
    throw new Error('No providers available.')
  })

module.exports = {
  providers,
  getSupportedProviders,
  getDefault
}
