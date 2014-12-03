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

    var map = parser.parse( text );

    var urlBase = THREE.Loader.prototype.extractUrlBase( url );

    var geometry, material, camera, fog,
      texture, images, color,
      light, hex, intensity,
      counter_models, counter_textures,
      total_models, total_textures,
      result;

    var target_array = [];

    // async geometry loaders

    for ( var typeID in this.geometryHandlers ) {

      var loaderClass = this.geometryHandlers[ typeID ][ "loaderClass" ];
      this.geometryHandlers[ typeID ][ "loaderObject" ] = new loaderClass();

    }

    // async hierachy loaders

    for ( var typeID in this.hierarchyHandlers ) {

      var loaderClass = this.hierarchyHandlers[ typeID ][ "loaderClass" ];
      this.hierarchyHandlers[ typeID ][ "loaderObject" ] = new loaderClass();

    }

    counter_models = 0;
    counter_textures = 0;

    result = { raw: map };

    var gameOverCamera;
    map.entities.forEach(function(entity) {
      var type = entity.type[0].toLowerCase() + entity.type.substring(1);

      if (type === 'playerSpawn') {
        var spawn = { position: entity.position };
        spawn.position.x *= -1;
        if (entity.angles) {
          spawn.rotation = entity.angles;
          Object.keys(spawn.rotation).forEach(function(key) {
            spawn.rotation[key] *= Math.PI / 180;
          });
        }
        if (!result.playerSpawns) { result.playerSpawns = []; }
        result.playerSpawns.push(spawn);
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

        var mesh = new THREE.Mesh(geometry, material)

        if (!result[type]) { result[type] = new THREE.Object3D(); }
        result[type].add(mesh);
      });

    });

    callbackFinished(result);

  }

}

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

  var color;
  if (jumpPad) {
    color = 0x00ff00;
  } else if (lava) {
    color = 0xff0000;
  } else if (water) {
    color = 0x0000ff;
  } else if (editorClip) {
    color = 0xffffff;
  } else {
    color = 0x222222 + Math.random() * 0xDDDDDD;
  }

  var opacity;
  if (jumpPad || lava || water) {
    opacity = .75;
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


module.exports = ReflexMapV6Loader;