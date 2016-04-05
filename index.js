(function() {
  var Hocr, hocr, htmlparser;

  hocr = exports;

  hocr.version = '0.0.1';

  htmlparser = require('htmlparser2');

  Hocr = (function() {

    function Hocr(html, callback) {
      this.html = html;
      this.callback = callback;
      this.result = [];
      this.parse();
    }

    Hocr.prototype.processBox = function(str) {
      var coords;
      var strTokenLength = 5;
      if (str.indexOf('bbox') === 0) {
        coords = str.split(' ');
        if(str.indexOf('x_wconf' === 0)) {
          strTokenLength = 7;
        }
        if (coords.length !== strTokenLength) {
          return str;
        } else {
          return {
            x0: coords[1],
            y0: coords[2],
            x1: coords[3],
            y1: coords[4]
          };
        }
      } else {
        return str;
      }
    };

    Hocr.prototype.getDataFromChildren = function(dom) {
      if (dom.children && dom.children[0]) {
        return this.getDataFromChildren(dom.children[0]);
      } else {
        return dom.data;
      }
    };

    Hocr.prototype.processWord = function(dom, idxPage, idxPar, idxLine) {
      return this.result[idxPage].par[idxPar].line[idxLine].words.push({
        id: dom.attribs.id,
        infos: this.processBox(dom.attribs.title),
        data: this.getDataFromChildren(dom)
      });
    };

    Hocr.prototype.processLine = function(dom, idxPage, idxPar) {
      var elem, _i, _len, _ref, _results;
      this.result[idxPage].par[idxPar].line.push({
        id: dom.attribs.id,
        infos: this.processBox(dom.attribs.title),
        words: []
      });
      _ref = dom.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        if (elem.attribs["class"] === 'ocr_word') {
          _results.push(this.processWord(elem, idxPage, idxPar, this.result[idxPage].par[idxPar].line.length - 1));
        }
      }
      return _results;
    };

    Hocr.prototype.processPar = function(dom, idxPage) {
      var elem, _i, _len, _results;
      this.result[idxPage].par.push({
        line: []
      });
      _results = [];
      for (_i = 0, _len = dom.length; _i < _len; _i++) {
        elem = dom[_i];
        if (elem.attribs["class"] === 'ocr_line') {
          _results.push(this.processLine(elem, idxPage, this.result[idxPage].par.length - 1));
        }
      }
      return _results;
    };

    Hocr.prototype.processPage = function(dom) {
      var carea, par, _i, _len, _ref, _results;
      if (dom.attribs.title.indexOf(';') > 0) {
        dom.attribs.title = dom.attribs.title.split(';')[1].replace(/^\s+/g, '').replace(/\s+$/g, '');
      }
      this.result.push({
        id: dom.attribs.id,
        infos: this.processBox(dom.attribs.title),
        par: []
      });
      _ref = dom.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        carea = _ref[_i];
        if (carea.attribs["class"] === 'ocr_carea') {
          _results.push((function() {
            var _j, _len2, _ref2, _results2;
            _ref2 = carea.children;
            _results2 = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              par = _ref2[_j];
              if (par.attribs["class"] === 'ocr_par') {
                if (par.children) {
                  _results2.push(this.processPar(par.children, this.result.length - 1));
                } else {
                  _results2.push(void 0);
                }
              }
            }
            return _results2;
          }).call(this));
        }
      }
      return _results;
    };

    Hocr.prototype.processBody = function(dom) {
      var elem, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = dom.length; _i < _len; _i++) {
        elem = dom[_i];
        if (elem.attribs["class"] === 'ocr_page') {
          _results.push(this.processPage(elem));
        }
      }
      return _results;
    };

    Hocr.prototype.processHtml = function(dom) {
      var elem, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = dom.length; _i < _len; _i++) {
        elem = dom[_i];
        if (elem.name === 'body') _results.push(this.processBody(elem.children));
      }
      return _results;
    };

    Hocr.prototype.toJSON = function(dom) {
      var elem, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = dom.length; _i < _len; _i++) {
        elem = dom[_i];
        if (elem.name === 'html') _results.push(this.processHtml(elem.children));
      }
      return _results;
    };

    Hocr.prototype.parse = function() {
      var handler, parser, self;
      self = this;
      handler = new htmlparser.DefaultHandler(function(error, dom) {
        if (error) {
          return self.callback(error, false);
        } else {
          self.toJSON(dom);
          return self.callback(false, self.result);
        }
      }, {
        verbose: false,
        ignoreWhitespace: true
      });
      parser = new htmlparser.Parser(handler);
      return parser.parseComplete(this.html);
    };

    return Hocr;

  })();

  hocr.Hocr = Hocr;

}).call(this);
