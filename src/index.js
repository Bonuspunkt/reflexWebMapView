var THREE = require('three');
var PointerLockControls = require('./PointerLockControls');
var ReflexMapV6Loader = require('./ReflexMapV6Loader');
var gatherMapInfo = require('./gatherMapInfo');
var input = require('./input');

var renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild( renderer.domElement );



(function() {
  var mapName = location.hash.substring(location.hash.lastIndexOf('/') + 1).replace(/\.map$/, '');
  document.title = 'webView ' + mapName;
}());


var mapInfo;
var camera;
var controls;
var scene;
var loader = new ReflexMapV6Loader();
loader.load(location.hash.substring(1), function(result) {

  if (!result) {
    blocker.textContent = 'could not load map / is not a valid map file'
    return;
  }

  mapInfo = result;

  if (havePointerLock) {
    blocker.textContent = 'ready, click to play';

    var movementInstruction = document.createElement('div');
    movementInstruction.textContent = '( W, A, S, D = Move, SPACE = Up, C = Down, MOUSE = Look around )';
    movementInstruction.style.padding = '10px';
    blocker.appendChild(movementInstruction);
  }

  var dom = gatherMapInfo(mapInfo.raw);
  blocker.appendChild(dom);
  blocker.appendChild(input.getForm());

  scene = new THREE.Scene();

  scene.add(mapInfo.worldSpawn);
  scene.add(mapInfo.pickups);
  scene.add(mapInfo.jumpPad);
  scene.add(mapInfo.playerSpawns);
  scene.add(mapInfo.teleporter);

  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );
  controls = new PointerLockControls( camera, 10 );

  var camObj = controls.getObject();
    
  if (mapInfo.endCam) {
    camObj.position.x = mapInfo.endCam.position.x;
    camObj.position.y = mapInfo.endCam.position.y;
    camObj.position.z = mapInfo.endCam.position.z;

    if (mapInfo.endCam.rotation) {
      controls.setRotation(
        Math.PI - mapInfo.endCam.rotation.x,
        -mapInfo.endCam.rotation.y
      );
    }

  }

  scene.add( camObj );

  scene.updateMatrix();
  scene.updateMatrixWorld();

  render({});

});

function render(e) {
  var requireRedraw = controls.update();

  requestAnimationFrame( render );

  // make the items rotate
  if (mapInfo.pickups) {
    mapInfo.pickups.children.forEach(function(pickup) { pickup.rotation.y += .02; });
  }

  renderer.render( scene, camera );
}


window.addEventListener( 'resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}, false );

window.addEventListener('hashchange', function() {
  location.reload();
})

//
// MOUSE STUFF
//
var blocker = document.getElementById( 'blocker' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 
  'mozPointerLockElement' in document || 
  'webkitPointerLockElement' in document;

if ( !havePointerLock ) {

  blocker.textContent = 'pointer api is not supported by your browser :(';

} else {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controls.setEnabled(true);

      blocker.style.display = 'none';

    } else {

      controls.setEnabled(false);

      blocker.style.display = '';

    }

  }

  var pointerlockerror = function ( event ) {

    blocker.style.display = '';

  }

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  blocker.addEventListener( 'click', function ( event ) {

    blocker.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = 
      element.requestPointerLock || 
      element.mozRequestPointerLock || 
      element.webkitRequestPointerLock;

    element.requestPointerLock();

  }, false );

}