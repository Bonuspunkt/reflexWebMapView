/*
 * Based on http://threejs.org/examples/js/controls/PointerLockControls.js
 */

var THREE = require('three');
var input = require('./input');

var PointerLockControls = function ( camera, speed ) {

  var scope = this;

  camera.rotation.set( 0, 0, 0 );

  var pitchObject = new THREE.Object3D();
  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.position.y = 10;
  yawObject.add( pitchObject );

  var enabled = false
  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var moveUp = false;
  var moveDown = false;

  var settings;

  var prevTime = performance.now();

  var velocity = new THREE.Vector3();

  var PI_2 = Math.PI / 2;

  var onMouseMove = function ( event ) {

    if ( !enabled ) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * 0.001 * settings.mouse.sensitivity;
    pitchObject.rotation.x -= movementY * 0.001 * settings.mouse.sensitivity;

    pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
  };

  var onKeyDown = function ( event ) {
    processKey(event.keyCode, true)
  };
  var onKeyUp = function ( event ) {
    processKey(event.keyCode, false);
  };

  var processKey = function(keyCode, value) {
    switch ( keyCode ) {

      case settings.keyboard.forward:
        moveForward = value;
        break;

      case settings.keyboard.backward:
        moveBackward = value;
        break;

      case settings.keyboard.left:
        moveLeft = value; 
        break;

      case settings.keyboard.right:
        moveRight = value;
        break;

      case settings.keyboard.up:
        moveUp = value;
        break;

      case settings.keyboard.down:
        moveDown = value;
        break;
    }
  };

  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  this.getObject = function () {

    return yawObject;

  };

  this.getDirection = function() {

    // assumes the camera itself is not rotated

    var direction = new THREE.Vector3( 0, 0, -1 );
    var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

    return function( v ) {

      rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

      v.copy( direction ).applyEuler( rotation );

      return v;

    }

  }();

  this.update = function () {

    if ( !enabled ) return;

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000 * (speed || 1);
    delta = Math.min(delta, .2);

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.y -= velocity.y * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    var vertFactor = Math.sin(pitchObject.rotation.x);
    var horzFactor = Math.cos(pitchObject.rotation.x);

    if ( moveForward ) {
      velocity.z -= 400.0 * delta * horzFactor;
      velocity.y += 400.0 * delta * vertFactor;
    }
    if ( moveBackward ) {
      velocity.z += 400.0 * delta * horzFactor;
      velocity.y -= 400.0 * delta * vertFactor;
    }

    if ( moveLeft ) velocity.x -= 400.0 * delta;
    if ( moveRight ) velocity.x += 400.0 * delta;

    if ( moveUp ) velocity.y += 400.0 * delta;
    if ( moveDown ) velocity.y -= 400.0 * delta;

    ['x','y','z'].forEach(function(key) {
      var value = Math.abs( velocity[key] );
      if (value < 1e-5) { velocity[key] = 0; }
    })

    yawObject.translateX( velocity.x * delta );
    yawObject.translateY( velocity.y * delta ); 
    yawObject.translateZ( velocity.z * delta );

    prevTime = time;
  };


  this.setRotation = function(yaw, pitch) {
    yawObject.rotation.y = yaw;
    pitchObject.rotation.x = pitch;
  }


  this.setEnabled = function(value) {
    enabled = value;
    settings = input.getSettings();
  }

};


module.exports = PointerLockControls;