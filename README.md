# node-power-info
Cross-platform node library for accessing battery and power adapter information

## Features
Reads power status in percent, along with information on the charge mode of all
installed batteries (charging, discharging, full, unknown).

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

## Example
```
var powerInfo = require('node-power-info');
powerInfo.getChargeStatus(function(batteryStats) {
  // statuses is an array containing an element for every installed battery
  batteryStats.forEach(function(stats) {
    // stats.powerLevel is the power level in percent
    // stats.chargeStatus is either 'charging', 'discharging', 'full', or 'unknown'
    console.log(stats.powerLevel + '%, currently ' + stats.chargeStatus);
  });
});
```

## license
MIT License (see LICENSE file)
