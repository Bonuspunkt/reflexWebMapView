var THREE = require('three');
var PointerLockControls = require('./PointerLockControls');
var parseMap = require('./parseMap');

var scene = new THREE.Scene(); 
var camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1, 10000 ); 

var controls = new PointerLockControls( camera, 10 );
scene.add( controls.getObject() );

var renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild( renderer.domElement );


function render(e) {
  var requireRedraw = controls.update();

  requestAnimationFrame( render );
  
  if (requireRedraw) {
    renderer.render( scene, camera );
  }
}
render({});


//var material = new THREE.MeshDepthMaterial({ 
var material = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00, 
  wireframe: true,
  side: THREE.DoubleSide
});

(function() {
  var mapName = location.hash.substring(location.hash.lastIndexOf('/') + 1);
  document.title = 'webView ' + mapName;
}());

var xhr = new XMLHttpRequest();
xhr.open('GET', location.hash.substring(1) + '.map');
xhr.send();
xhr.onload = function() {
  var mapFile = xhr.responseText;
  var mapData = parseMap(mapFile);
  var brushes = mapData.filter(function(t) { return t._type === 'brush' });
  brushes.forEach(function(brush) {
    var vertices = brush.vertices.map(function(v) { 
      return new THREE.Vector3(-v[0], v[1], v[2]); 
    });
    var faces = brush.faces.map(function(f) { 
      if (typeof f[8] === 'number') {
        return [new THREE.Face3(f[5], f[6], f[7]), new THREE.Face3(f[7], f[8], f[5])];
      }
      return [new THREE.Face3(f[5], f[6], f[7])];
    }).reduce(function(prev, curr) { return prev.concat(curr); }, []);

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.mergeVertices();

    var mesh = new THREE.Mesh(geom, material)

    scene.add(mesh);
  });

  render({});
};
xhr.onerror = function() {
  debugger;
}

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

      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

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