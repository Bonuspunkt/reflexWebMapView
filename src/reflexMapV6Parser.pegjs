map
  = 'reflex map version ' version:uint newline entities:entity+
    { return { version: version, entities: entities }; }

// types
color
  = '\t' 'ColourXRGB32' ' ' property:letters ' ' value:hexInt newline
  { return { type: 'color', property: property, value: value }; }

string
  = '\t' 'String' ('64'/'32') ' ' property:letters ' ' value:nonWhite newline
    { return { type: 'string', property: property, value: value }; }

uint8
  = '\t' 'UInt8' ' ' property:letters ' ' value:uint newline
  { return { type: 'number', property: property, value: value }; }

uint32
  = '\t' 'UInt32' ' ' property:letters ' ' value:uint newline
  { return { type: 'number', property: property, value: value }; }

vector3
  = '\t' 'Vector3' ' ' property:letters ' ' x:float ' ' y:float ' ' z:float newline
  { return { type: 'Vector3', property: property, x: x, y: y, z: z }; }



property "property"
  = color
  / string
  / uint8
  / uint32
  / vector3

vertex
  = '\t\t' x:float ' ' y:float ' ' z:float newline
  { return { x:x, y:y, z:z }; }

face
  = '\t\t' textureXOffset:float ' ' textureYOffset:float 
    ' ' textureXScale:float ' ' textureYScale:float ' ' rotation:float
    ' ' face0:uint faceRest:(' ' uint)+ ' ' texture:nonWhite newline
  { return { 
      offset: { x: textureXOffset, y: textureYOffset }, 
      scale: { x: textureXScale, y: textureYScale }, 
      rotation: rotation,
      faces: [Number(face0)].concat( faceRest.map(function(f) { return f[1]; }) ),
      texture: texture
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
  = 'entity' newline '\ttype ' type:letters+ newline 
    properties:property*
    brushes:brush*
  { return { type: type, properties: properties, brushes:brushes }; }

// baseTypes
newline       = '\r\n' / '\n'
hexInt        = [0-9A-Fa-f]+ { return parseInt(text(), 16); }
uint          = "0" / ([1-9] [0-9]*) { return parseInt(text()); }
float         = '-'? ("0" / [1-9][0-9]*) ('.'[0-9]+)? { return parseFloat(text()); }
letter        = [0-9A-Za-z]
letters       = letter+ { return text(); }
nonWhite      = [\x21-\u10FFFF]* { return text(); }
