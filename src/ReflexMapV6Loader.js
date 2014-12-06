/**
 * Based on SceneLoader 
 * ( https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/SceneLoader.js )
 */
var THREE = require('three');
var parser = require('./reflexMapV6Parser');
var resolvePickupType = require('./resolvePickupType');

var ReflexMapV6Loader = function ( manager ) {

  this.onLoadStart = function () {};
  this.onLoadProgress = function() {};
  this.onLoadComplete = function () {};

  this.callbackSync = function () {};
  this.callbackProgress = function () {};

  this.geometryHandlers = {};
  this.hierarchyHandlers = {};

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

ReflexMapV6Loader.prototype = {

  constructor: ReflexMapV6Loader,

  load: function ( url, onLoad, onProgress, onError ) {

    var scope = this;

    var loader = new THREE.XHRLoader( scope.manager );
    loader.setCrossOrigin( this.crossOrigin );
    loader.load( url, function ( text ) {

      scope.parse( text, onLoad, url );

    }, onProgress, onError );

  },

  setCrossOrigin: function ( value ) {

    this.crossOrigin = value;

  },

  addGeometryHandler: function ( typeID, loaderClass ) {

    this.geometryHandlers[ typeID ] = { "loaderClass": loaderClass };

  },

  addHierarchyHandler: function ( typeID, loaderClass ) {

    this.hierarchyHandlers[ typeID ] = { "loaderClass": loaderClass };

  },

  parse: function ( text, callbackFinished, url ) {

    var scope = this;

    try {
      var map = parser.parse( text );
    } catch (e) {
      console.error(e);
      return callbackFinished(null);
    }

    var result = { raw: map };

    var gameOverCamera;
    map.entities.forEach(function(entity) {
      var type = entity.type[0].toLowerCase() + entity.type.substring(1);

      if (type === 'playerSpawn') {
        var playerSpawn = generatePlayerSpawn(entity);

        if (!result.playerSpawns) { result.playerSpawns = new THREE.Object3D(); }
        result.playerSpawns.add(playerSpawn);
      }

      if (gameOverCamera &&
          type === 'target' && entity.name === gameOverCamera) {
        var spawn = { position: entity.position };
        spawn.position.x *= -1;
        if (entity.angles) {
          spawn.rotation = entity.angles;
          Object.keys(spawn.rotation).forEach(function(key) {
            spawn.rotation[key] *= Math.PI / 180;
          });
        }
        result.endCam = spawn;
      }


      if (type === 'worldSpawn') {
        gameOverCamera = entity.targetGameOverCamera;
      }

      if (type === 'pickup') {
        if (!result.pickups) { result.pickups = new THREE.Object3D(); }
        var pickup = resolvePickupType(entity.pickupType);
        pickup.position.x = -entity.position.x;
        pickup.position.y = entity.position.y + 32;
        pickup.position.z = entity.position.z;
        result.pickups.add(pickup);
      }

      entity.brushes.forEach(function(brush) {

        var vertices = brush.vertices.map(function(vertex) { 
          return new THREE.Vector3(-vertex.x, vertex.y, vertex.z); 
        });

        var faces = brush.faces.map(function(face) {
          var indexes = face.indexes;
          if (indexes.length == 4) {
            return [
              new THREE.Face3(indexes[0], indexes[1], indexes[2]),
              new THREE.Face3(indexes[2], indexes[3], indexes[0])
            ];
          }
          else {
            return [ 
              new THREE.Face3(face.indexes[0], face.indexes[1], face.indexes[2]) 
            ];
          }
        }).reduce(function(prev, curr) { return prev.concat(curr); }, []);

        var materialInfo = getMaterialInfo(entity, brush);

        var material = new THREE.MeshBasicMaterial({ 
          color: materialInfo.color,
          transparent: materialInfo.opacity != 1,
          opacity: materialInfo.opacity,
          side: THREE.DoubleSide,
        });

        var geometry = new THREE.Geometry();
        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.mergeVertices();


        var wireframeColor = getWireframeColor(material.color);
        var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
          material,
          new THREE.MeshBasicMaterial( { 
            color: wireframeColor,
            wireframe: true
          })
        ]);

        if (!result[type]) { result[type] = new THREE.Object3D(); }
        result[type].add(mesh);
      });

    });

    callbackFinished(result);

  }

}


function generatePlayerSpawn(entity) {
  var block = new THREE.Mesh(
    new THREE.BoxGeometry(36, 56, 36), 
    new THREE.MeshBasicMaterial({ color: 0x130055 }) // 
  );

  var directionIndicator = new THREE.Mesh(
    new THREE.OctahedronGeometry(9), 
    new THREE.MeshBasicMaterial({ color: 0x330088 }) // 
  );
  directionIndicator.position.x = 18;
  directionIndicator.rotation.z = Math.PI / 2;

  var playerSpawn = new THREE.Object3D();
  playerSpawn.add(block);
  playerSpawn.add(directionIndicator);

  if (entity.position) {
    playerSpawn.position.x = -entity.position.x;
    playerSpawn.position.y = entity.position.y + 56/2;
    playerSpawn.position.z = entity.position.z;
  } else {
    playerSpawn.position.y = 56/2;
  }

  if (entity.angles) {
    playerSpawn.rotation.y = -(entity.angles.x * Math.PI / 180) - Math.PI/2; 
  }

  return playerSpawn;
}


var maxGray = 0xE0;
var maxColor = 0x1F;
function getMaterialInfo(entity, brush) {
  var editorClip = brush.faces.some(function(face) {
    return face.texture.name.indexOf('internal/editor/textures/editor_clip') !== -1;
  });
  var lava = brush.faces.some(function(face) {
    return face.texture.name.indexOf('environment/liquids/lava/lava') !== -1;
  });
  var water = brush.faces.some(function(face) {
    return face.texture.name.indexOf('environment/liquids/water/water') !== -1;
  });
  var jumpPad = entity.type === 'JumpPad';
  var teleporter  = entity.type === 'Teleporter';

  var color;
  if (teleporter) {
    color = 0xff00ff
  } else if (jumpPad) {
    color = 0x00ff00;
  } else if (lava) {
    color = 0xff0000;
  } else if (water) {
    color = 0x3333ff;
  } else if (editorClip) {
    color = 0xffffff;
  } else {
    var grey = maxGray * Math.random();
    var r = maxColor * Math.random() << 16;
    var g = maxColor * Math.random() << 8;
    var b = maxColor * Math.random() | 0;

    color = r + (grey << 16) + g + (grey << 8) + b + (grey|0);
  }

  var opacity;
  if (lava || water) {
    opacity = .75;
  } else if (jumpPad || teleporter) {
    opacity = .5
  } else if (editorClip) {
    opacity = .3;
  } else {
    opacity = 1;
  }

  return {
    color: color,
    opacity: opacity
  };
}


function getWireframeColor(color) {
  var r = color.r + (color.r < .5 ? .1 : -.1);
  var g = color.g + (color.r < .5 ? .1 : -.1);
  var b = color.b + (color.r < .5 ? .1 : -.1);

  return (
    ((r * 255) << 16) +
    ((g * 255) << 8) +
    b * 255
  );
}


module.exports = ReflexMapV6Loader;