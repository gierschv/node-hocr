(function() {
  var fs, hocr, util;

  hocr = require('../src/hocr');

  fs = require('fs');

  util = require('util');

  hocr = new hocr.Hocr(fs.readFileSync('test.html').toString(), function(error, dom) {
    if (error) {
      return console.log(error);
    } else {
      return util.puts(util.inspect(dom, false, null));
    }
  });

}).call(this);
