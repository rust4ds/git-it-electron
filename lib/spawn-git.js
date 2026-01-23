//
// This file is a wrapper to the exec call used in each of the verify scripts.
// It first checks what operating system is being used and if Windows it uses
// the Portable Git rather than the system Git.
//

var exec = require('child_process').exec
var path = require('path')
var os = require('os')

// Get the correct path to PortableGit
// When packaged, check app.asar.unpacked first (for unpacked files),
// then fall back to process.resourcesPath
// When in development, use __dirname
function getWinGitPath () {
  var fs = require('fs')
  var gitPath
  
  // Check if we're in a packaged app by looking for app.asar in __dirname
  var isPackaged = __dirname.indexOf('app.asar') !== -1
  
  if (isPackaged && process.resourcesPath) {
    // Packaged app - check for unpacked files first
    // Unpacked files go to app.asar.unpacked directory
    var unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'PortableGit', 'bin', 'git.exe')
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath
    }
    // Fall back to resources path (if PortableGit is copied outside asar)
    gitPath = path.join(process.resourcesPath, 'assets', 'PortableGit', 'bin', 'git.exe')
  } else {
    // Development - use __dirname
    gitPath = path.join(__dirname, '..', 'assets', 'PortableGit', 'bin', 'git.exe')
  }
  return gitPath
}

var winGit = getWinGitPath()

module.exports = function spawnGit (command, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = null
  }
  if (os.platform() === 'win32') {
    exec('"' + winGit + '" ' + command, options, callback)
  } else {
    exec('git  ' + command, options, callback)
  }
}
