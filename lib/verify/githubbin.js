#!/usr/bin/env node

var path = require('path')
var httpRequest = require(path.join(__dirname, '../../lib/http-request.js'))
var exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
var helper = require(path.join(__dirname, '../../lib/helpers.js'))
var userData = require(path.join(__dirname, '../../lib/user-data.js'))

var user = ''

var addToList = helper.addToList
var markChallengeCompleted = helper.markChallengeCompleted

var currentChallenge = 'githubbin'

var total = 3
var counter = 0

// verify they set up git config
// verify that user exists on GitHub (not case sensitve)
// compare the two to make sure cases match

module.exports = function verifyGitHubbinChallenge () {
  counter = 0
  console.log('[GitHubbin] Starting verification...')

  exec('config user.username', function (err, stdout, stderr) {
    console.log('[GitHubbin] exec callback received', { err: err, stdout: stdout, stderr: stderr })
    if (err) {
      // TODO Catch 'Command failed: /bin/sh -c git config user.username'
      addToList('Error: ' + err.message, false)
      return helper.challengeIncomplete()
    }
    user = stdout.trim()
    console.log('[GitHubbin] username from git config:', user)
    if (user === '') {
      addToList('No username found.', false)
      helper.challengeIncomplete()
    } else {
      counter++
      addToList('Username added to Git config!', true)
      checkGitHub(user)
    }
  })

  function checkGitHub (user) {
    console.log('[GitHubbin] checkGitHub called for user:', user)
    var options = {
      url: 'https://api.github.com/users/' + user,
      json: true,
      headers: { 'User-Agent': 'git-it-electron' }
    }

    console.log('[GitHubbin] Making HTTP request to:', options.url)
    httpRequest(options, function (error, response, body) {
      console.log('[GitHubbin] HTTP response received', { error: error, statusCode: response && response.statusCode, body: body })
      if (error) {
        addToList('Error: ' + error.message, false)
        return helper.challengeIncomplete()
      }
      if (response.statusCode === 200) {
        counter++
        addToList("You're on GitHub!", true)
        checkCapitals(body.login, user)
      } else if (response.statusCode === 404) {
        addToList("GitHub account matching Git config\nusername wasn't found.", false)
        return helper.challengeIncomplete()
      } else {
        addToList('GitHub API error (status ' + response.statusCode + ')', false)
        return helper.challengeIncomplete()
      }
    })
  }

  function checkCapitals (githubUsername, configUsername) {
    if (configUsername.match(githubUsername)) {
      counter++
      addToList('Username same on GitHub and\nGit config!', true)
    } else {
      addToList('GitHub & Git config usernames\ndo not match.', false)
      helper.challengeIncomplete()
    }
    if (counter === total) {
      markChallengeCompleted(currentChallenge)
      userData.updateData(currentChallenge)
    }
  }
}
