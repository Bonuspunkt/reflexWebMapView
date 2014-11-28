(function() {

var START = 'reflex map version 6\r\n';

var firstLine = /^(\S+)$/
var secondLine = /^\t(\S+)(?:\s+(\S+))*$/;
var thirdLine = /^\t\t(\S+)(?:\s+(\S+))+\s*$/;

function parseMap(content) {
  if (content.indexOf(START) !== 0) { return 'error'; }

  var lines = content.split(/\r\n/g);

  var result = [];

  var current;
  var collection;

  lines.forEach(function(line, index) {
    if (!index) { return; }

    if (line[0] !== '\t' && line !== '') {

      current = { _type: line };
      result.push(current);
      return;
    }

    if (line[0] === '\t' && line[1] !== '\t') {
      var parts = line.substring(1).split(/\s+/g);
      if (!/^[A-Z]/.test(parts[0])) {
        collection = current[parts[0]] = parts[1] || [];
        return;
      }
      current[parts[1]] = parts[2];
      return;
    }

    if (line[0] === '\t' && line[1] === '\t') {
      var data = line.substring(2).split(/\s+/g).map(function(part) {
        if (/^-?\d+(\.\d+)?$/.test(part)) { return Number(part); }
        return part;
      });

      collection.push(data);
    }
  });

  return result;
}



if (typeof module !== 'undefined') {
  module.exports = parseMap;
} else {
  window.parseMap = parseMap;
}

}());