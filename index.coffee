hocr = exports
hocr.version = '0.0.1'

# Dependencies
htmlparser = require 'htmlparser2'

class Hocr
  constructor: (@html, @callback) ->
    @result = []
    @parse()

  processBox: (str) ->
    if (str.indexOf('bbox') == 0)
      coords = str.split(' ')
      if (coords.length != 5)
        str
      else
        { x0: coords[1], y0: coords[2], x1: coords[3], y1: coords[4] } 
    else
      str

  processWord: (dom, idxPage, idxPar, idxLine) ->
    @result[idxPage].par[idxPar].line[idxLine].words.push({id: dom.attribs.id, infos: @processBox(dom.attribs.title), data: dom.children[0].children[0].data})

  processLine: (dom, idxPage, idxPar) ->
    @result[idxPage].par[idxPar].line.push({id: dom.attribs.id, infos: @processBox(dom.attribs.title), words: []})
    @processWord elem, idxPage, idxPar, @result[idxPage].par[idxPar].line.length - 1 for elem in dom.children when elem.attribs.class is 'ocr_word'

  processPar: (dom, idxPage) ->
    @result[idxPage].par.push({line: []})
    @processLine elem, idxPage, @result[idxPage].par.length - 1 for elem in dom when elem.attribs.class is 'ocr_line'

  processPage: (dom) ->
    @result.push({id: dom.attribs.id, infos: dom.attribs.title, par:[]})
    for carea in dom.children when carea.attribs.class is 'ocr_carea'
      for par in carea.children when par.attribs.class is 'ocr_par'
        if (par.children)
          @processPar par.children, @result.length - 1

  processBody: (dom) ->
    @processPage elem for elem in dom when elem.attribs.class is 'ocr_page'

  processHtml: (dom) ->
    @processBody elem.children for elem in dom when elem.name is 'body'

  toJSON: (dom) ->
    @processHtml elem.children for elem in dom when elem.name is 'html'

  parse: ->
    self = @
    handler = new htmlparser.DefaultHandler (error, dom) ->
      if error
        self.callback error, false
      else
        self.toJSON dom
        self.callback false, self.result
    , { verbose: false, ignoreWhitespace: true }
    parser = new htmlparser.Parser(handler)
    parser.parseComplete(@html)

hocr.Hocr = Hocr