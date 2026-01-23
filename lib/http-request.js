//
// Simple HTTP/HTTPS GET request helper using Node's built-in modules.
// Replaces the deprecated 'request' package.
//

var https = require('https')
var http = require('http')

module.exports = function httpRequest (options, callback) {
  if (typeof options === 'string') {
    options = { url: options }
  }

  var urlStr = options.url
  var parsed = new URL(urlStr)
  var client = parsed.protocol === 'https:' ? https : http

  var reqOptions = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: 'GET',
    headers: options.headers || {},
    timeout: 30000
  }

  var callbackCalled = false
  var safeCallback = function (err, res, body) {
    if (!callbackCalled) {
      callbackCalled = true
      callback(err, res, body)
    }
  }

  var req = client.request(reqOptions, function (res) {
    var data = ''

    res.on('data', function (chunk) {
      data += chunk
    })

    res.on('end', function () {
      var body = data
      if (options.json) {
        try {
          body = JSON.parse(data)
        } catch (e) {
          return safeCallback(new Error('Invalid JSON response'), null, null)
        }
      }
      safeCallback(null, { statusCode: res.statusCode }, body)
    })
  })

  req.on('error', function (err) {
    safeCallback(err, null, null)
  })

  req.on('timeout', function () {
    req.destroy()
    safeCallback(new Error('Request timed out'), null, null)
  })

  req.end()
}
