//
// This file is a wrapper to the exec call used in each of the verify scripts.
// It first checks what operating system is being used and if Windows it uses
// the system Git if available, otherwise falls back to Portable Git.
//

var exec = require('child_process').exec
var execSync = require('child_process').execSync
var path = require('path')
var os = require('os')

// Check if system git is available in PATH
function isSystemGitAvailable () {
  try {
    // Try to execute git --version with a short timeout
    execSync('git --version', { timeout: 1000, stdio: 'ignore' })
    return true
  } catch (err) {
    return false
  }
}

// Get the correct path to git on Windows
// First checks if system git is available, then falls back to PortableGit
// When packaged, check app.asar.unpacked first (for unpacked files),
// then fall back to process.resourcesPath
// When in development, use __dirname
function getWinGitPath () {
  // First check if system git is available
  if (isSystemGitAvailable()) {
    return 'git'  // Use system git, let PATH resolve it
  }
  
  // Fall back to PortableGit
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
    if (winGit === 'git') {
      // System git - let exec handle PATH resolution
      exec('git ' + command, options, callback)
    } else {
      // PortableGit - use quoted path
      exec('"' + winGit + '" ' + command, options, callback)
    }
  } else {
    exec('git  ' + command, options, callback)
  }
}
