require('./input.styl');
var domRender = require('./domRender');


var settings = {
  fov: 90,
  mouse: {
    sensitivity: 5,
  },
  keyboard: {
    forward: 87,  // w
    backward: 83, // s
    left: 65,     // a
    right: 68,    // d

    up: 32,       // space
    down: 67      // c
  }
};

var STORAGE_KEY = 'settings'

var stored = window.localStorage.getItem(STORAGE_KEY);
if (stored) {
  settings = JSON.parse( stored );
}

function saveSettings() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify( settings ))
}


module.exports = {
  getForm: function(camera) {

    camera.fov = settings.fov;

    var sensDisplay;
    var mouseSettings = [{
      tagName: 'h3',
      children: ['mouse']
    }, {
      tagName: 'div',
      children: [{
        tagName: 'label',
        children: ['sensitivity']
      }, {
        tagName: 'input',
        type: 'range',
        min: 1,
        max: 10,
        step: 0.1,
        style: { width: 115, verticalAlign: 'middle' },
        value: settings.mouse.sensitivity,
        change: function(e) {
          sensDisplay.value = e.target.value;

          settings.mouse.sensitivity = e.target.value;
          saveSettings();
        }
      }, {
        tagName: 'input',
        disabled: true,
        value: settings.mouse.sensitivity,
        style: { width: '30px', textAlign: 'center' },
        _init: function (el) { sensDisplay = el; }
      }]
    }];

    var keybindings = [{
      tagName: 'h3',
      children: ['keyboard']
    }].concat(Object.keys(settings.keyboard).map(function(key) {
      return {
        tagName: 'div',
        children: [{
          tagName: 'label',
          children: [key]
        }, {
          tagName: 'input',
          type: 'button',
          value: "'" + String.fromCharCode(settings.keyboard[key]) + "'",
          click: function(e) {
            e.preventDefault();

            this.value = 'press button';
            var btn = this;

            function keyDown(e) {
              e.preventDefault();
              
              settings.keyboard[key] = e.keyCode;
              btn.value = "'" + String.fromCharCode(e.keyCode) + "'";
              saveSettings();
              
              document.removeEventListener('keydown', keyDown);
            }

            document.addEventListener('keydown', keyDown);
          }
        }]
      }
    }));

    var fovDisplay;
    return domRender({
      tagName: 'form',
      className: 'settings block',
      click: function(e) {
        if (e.target.tagName !== 'INPUT') { return; }
        e.cancelBubble = true;
        e.preventDefault();
      },
      children: [{
        tagName: 'label',
        children: ['FOV']
      }, {
        tagName: 'input',
        type: 'range',
        min: 75,
        max: 150,
        step: 1,
        value: settings.fov,
        style: { width: 115, verticalAlign: 'middle' },
        change: function() {
          camera.fov = this.value;
          camera.updateProjectionMatrix();
          fovDisplay.value = this.value;
          settings.fov = this.value;
          saveSettings();
        }
      }, {
        tagName: 'input',
        value: settings.fov,
        style: { width: '30px', textAlign: 'center' },
        _init: function(el) { fovDisplay = el; }
      }].concat(mouseSettings).concat(keybindings)
    });
  },
  getSettings: function() {
    return JSON.parse(JSON.stringify(settings));
  }
};