var THREE = require('three');
var PointerLockControls = require('./PointerLockControls');
var ReflexMapV6Loader = require('./ReflexMapV6Loader');

var map;


var renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild( renderer.domElement );

var camera;
function render(e) {
  var requireRedraw = map.controls.update();

  requestAnimationFrame( render );
  
  if (requireRedraw)
    renderer.render( map.scene, camera );
}


(function() {
  var mapName = location.hash.substring(location.hash.lastIndexOf('/') + 1);
  document.title = 'webView ' + mapName;
}());

var loader = new ReflexMapV6Loader();
loader.load(location.hash.substring(1) + '.map', function(result) {

  map = result;

  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );
  map.controls = new PointerLockControls( camera, 10 );
  map.scene.add( map.controls.getObject() );


  render({});

});


window.addEventListener( 'resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}, false );

// Selection stuff
// view-source:http://threejs.org/examples/webgl_effects_vr.html
//

//
// MOUSE STUFF
//
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      map.controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      map.controls.enabled = false;

      blocker.style.display = '-webkit-box';
      blocker.style.display = '-moz-box';
      blocker.style.display = 'box';

      instructions.style.display = '';

    }

  }

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  }

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {

      var fullscreenchange = function ( event ) {

        if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

          document.removeEventListener( 'fullscreenchange', fullscreenchange );
          document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

          element.requestPointerLock();
        }

      }

      document.addEventListener( 'fullscreenchange', fullscreenchange, false );
      document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

      element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

      element.requestFullscreen();

    } else {

      element.requestPointerLock();

    }

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}