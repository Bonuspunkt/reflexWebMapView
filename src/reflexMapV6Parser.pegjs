map
  = 'reflex map version ' version:uint newline entities:entity+
    { return { version: version, entities: entities }; }

// types
propertyColor
  = '\t' 'ColourXRGB32' ' ' property:letters ' ' value:hexInt newline
  { return { type: 'color', name: property, value: value }; }

propertyString
  = '\t' 'String' ('64'/'32') ' ' property:letters ' ' value:nonWhite newline
    { return { type: 'string', name: property, value: value }; }

propertyFloat
  = '\t' 'Float' ' ' property:letters ' ' value:float newline
  { return { type: 'number', name: property, value: value }; }

propertyUint8
  = '\t' 'UInt8' ' ' property:letters ' ' value:uint newline
  { return { type: 'number', name: property, value: value }; }

propertyUint32
  = '\t' 'UInt32' ' ' property:letters ' ' value:uint newline
  { return { type: 'number', name: property, value: value }; }

propertyVector3
  = '\t' 'Vector3' ' ' property:letters ' ' x:float ' ' y:float ' ' z:float newline
  { return { type: 'Vector3', name: property, value: { x: x, y: y, z: z } }; }



property
  = propertyColor
  / propertyFloat
  / propertyString
  / propertyUint8
  / propertyUint32
  / propertyVector3

vertex
  = '\t\t' x:float ' ' y:float ' ' z:float newline
  { return { x:x, y:y, z:z }; }

face
  = '\t\t' textureXOffset:float ' ' textureYOffset:float 
    ' ' textureXScale:float ' ' textureYScale:float ' ' rotation:float
    ' ' face0:uint faceRest:(' ' uint)+ ' ' texture:nonWhite newline
  { return { 
      indexes: [Number(face0)].concat( faceRest.map(function(f) { return f[1]; }) ),
      texture: {
        name: texture,
        offset: { x: textureXOffset, y: textureYOffset }, 
        scale: { x: textureXScale, y: textureYScale }, 
        rotation: rotation
      }
    };
  }

brush
  = 'brush' newline
    '\t' 'vertices' newline
    vertices:vertex+
    '\t' 'faces' newline
    faces:face+
  { return {
      vertices: vertices,
      faces: faces
    };
  }

// 
entity
  = 'entity' newline '\ttype ' type:letters newline 
    properties:property*
    brushes:brush*
  { var result = { type: type, brushes:brushes };
    properties.forEach(function(property) { result[property.name] = property.value });
    return result;
  }

// baseTypes
newline       = '\r\n' / '\n'
hexInt        = [0-9A-Fa-f]+ { return parseInt(text(), 16); }
uint          = "0" / ([1-9] [0-9]*) { return parseInt(text()); }
float         = '-'? ("0" / [1-9][0-9]*) ('.'[0-9]+)? { return parseFloat(text()); }
letter        = [0-9A-Za-z]
letters       = letter+ { return text(); }
nonWhite      = [\x21-\u10FFFF]* { return text(); }
