hocr = require '../src/hocr'
fs = require 'fs'
util = require 'util'

hocr = new hocr.Hocr(fs.readFileSync('test.html').toString(), (error, dom)->
  if (error)
    console.log(error)
  else
    util.puts(util.inspect(dom, false, null));
)

