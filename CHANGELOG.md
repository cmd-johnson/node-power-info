## 0.1.2
* Added support for detecting the 'charged' status on Darwin
* Added CHANGELOG.md to keep track of changes

## 0.1.3
* Messed up the npm versioning system and had to republish the whole thing to be able to fetch the new changes via `npm install`

## 0.1.5
* Added support for detecting batteries showing up as 'CKB[\d]+' on some linux systems

## 0.1.6
* Fixed a typo in the battery path regex

## 0.1.7
* Add support for retrieving the approximate remaining time until the battery is (dis-)charged on macOS

## 1.0.0
* Refactor everything to use a proper class for storing battery information
* The module now uses promises instead of callbacks where possible
* Providers are now selected based on availablility instead of the active operating system
* Add support for remainingTime information on linux systems using a uevent provider

## 1.0.1
* Improve handling of duration edge-cases in uevent provider

## 1.0.2
* Fix status name being incorrectly read from uevent data

## 1.0.3
* Handle the uevent edge-case of currentPower being zero
