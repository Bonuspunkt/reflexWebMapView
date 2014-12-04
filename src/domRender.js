var SPECIAL_MEANING = [
  // not supported
  'innerHTML', 'textContent', 

  // properties that need special handling
  'tagName', 
  'style', 
  'children',

  // special functions
  '_init' // will be called after the domNode with children was build
];

function render(obj) {
  if (typeof (obj) !== 'object') {
    return document.createTextNode(obj);
  }

  if (obj.innerHTML) {
    console.error('must not use innerHTML - will be ignored');
  }
  if (obj.textContent) {
    console.error('use children:["text"] instead');
  }

  var result = document.createElement(obj.tagName || 'div');
  Object.keys(obj).filter(function (key) {
    return SPECIAL_MEANING.indexOf(key) === -1;
  }).forEach(function (key) {
    if (typeof (obj[key]) === 'function') {
      result.addEventListener(key, obj[key]);
    } else {
      result[key] = obj[key];
    }
  });


  if (obj.style) {
    Object.keys(obj.style).forEach(function (key) {
      var value = obj.style[key];
      if (typeof (value) === 'number') {
        value = value + 'px';
      }
      result.style[key] = value;
    });
  }

  if (obj.children) {
    obj.children.forEach(function (child) {
      var childNode = render(child);
      result.appendChild(childNode);
    });
  }

  if (obj._init) {
    obj._init.call(null, result);
  }

  return result;
}

module.exports = render;
