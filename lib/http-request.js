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
    headers: options.headers || {}
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
          return callback(new Error('Invalid JSON response'), null, null)
        }
      }
      callback(null, { statusCode: res.statusCode }, body)
    })
  })

  req.on('error', function (err) {
    callback(err, null, null)
  })

  req.end()
}
