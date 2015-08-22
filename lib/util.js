'use strict';

/* eslint-disable no-console */

var async = require('async');
var fs = require('fs');
var os = require('os');
var path = require('path');

module.exports.logError = function logError(errorDetails, errorObject) {
  var packageInfo = require('../package');
  var message = [
    '[' + packageInfo.name + '@' + packageInfo.version + ']',
    'an error occurred: "' + errorDetails + '"',
    'please report this issue to ' + packageInfo.bugs.url + ',',
    'along with the following information:',
    'os:' + os.type() + ' ' + os.arch + ' @ ' + os.release()
  ].join('\n');

  if (errorObject) {
    message += ['',
      errorObject,
      'stacktrace:',
      (new Error()).stack
    ].join('\n');
  }

  console.error(message);
};

module.exports.findSubdirectories = function findSubdirectories(basePath, subdirsFoundCb) {
  // find all files at the given path
  fs.readdir(basePath, function(err, files) {
    if (err) {
      subdirsFoundCb(err);
    }

    // filter out all files, leaving the directories
    async.filter(files, function(file, isDirCallback) {
      fs.stat(path.join(basePath, file), function(err2, stats) {
        isDirCallback(!err2 && stats.isDirectory());
      });
    }, subdirsFoundCb);
  });
};
