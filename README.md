# node-power-info
Cross-platform node library for accessing battery and power adapter information

## Features
Reads power status in percent, along with information on the charge mode of all
installed batteries (charging, discharging, full, unknown) as well as the
estimated remaining time until the battery is fully (dis-)charged.

## Cross-platform
For the time being, only supports linux and darwin platforms. Windows is planned
but it could take some time until I get to do that.
If you think you can provide an implementation for windows or any other platform,
feel free to make a pull request!

## Known issues
Since I'm not owning a mac, the darwin implementation is completely untested. The
current solution simply runs `pmset -g batt` to get basic information on the
batteries installed and runs the output through a regex to extract percentage
and charge status data. That should work in theory, but if you have time to test
it in a real environment (possibly including some edge cases, like output when
at 100%), please, take that time and report your findings!

## How it works
To get information on the available batteries, the module sports a list of
information providers that are each supported on different systems. When
requiring the module, it first checks every provider for availability. The first
found supported provider will be used as default provider for accessing battery
information.

In this way, the module doesn't depend on node's `require('os').type()` value,
but tries all available options for maximum compatibility.

## Example
```js
const powerInfo = require('node-power-info')

powerInfo.getDefault()
  .then(provider => provider.getBatteries())
  .then(batteries => batteries.forEach(battery => {
    console.dir(battery)
    console.log(`${battery.id} is at ${battery.powerLevel}% and ${battery.chargeStatus}.`)
    if (battery.isTimeAvailable) {
      const remainingMinutes = ('0' + battery.remainingTimeMinutes).slice(-2)
      console.log(`${battery.remainingTimeHours}:${remainingMinutes} remaining`)
    }
  }))
```

## API
### `powerInfo`
#### `powerInfo.getDefault(): Promise<Provider>`
Resolves to the default provider as soon as all providers were checked for
availability.

#### `powerInfo.getSupportedProviders(): Promise<Provider[]>`
Resolves to a list of all providers that are supported on the current system.

#### `powerInfo.providers: Provider[]`
A list of all providers known to the module, disregarding if they are
supported or not.

### `Provider`
#### `Provider.name: string`
The name of the provider.

#### `Provider.getBatteries(): Promise<Battery[]>`
Fetches information on all available batteries.

#### `Provider.checkIsSupported(): Promise<boolean>`
Resovles to true if the provider is available on the current system.

### `Battery`
#### `Battery.id: string`
The id of the battery as provided by the OS.

#### `Battery.powerLevel: number`
The power level of the battery in percent.

#### `Battery.chargeStatus: string`
The battery's status. Either `'charging'`, `'discharging'`, `'full'` or
`'unknown'`.

#### `Battery.isTimeAvailable: boolean`
True if a remaining time was set.

#### `Battery.remainingTimeHours: number`
The remaining (dis-)charge time in whole hours, rounded down.
Is null if `isTimeAvailable` is  `false`.

#### `Battery.remainingTimeMinutes: number`
The remaining (dis-)charge time in minutes after subtracting the remaining
hours, rounded down.
Is null if `isTimeAvailable` is  `false`.

## Licence
MIT Licence (see LICENSE file)
