var THREE = require('three');

function createWeapon(color) {
  var material = new THREE.MeshBasicMaterial({ color: color,  wireframe: true });
  var geometry = new THREE.CylinderGeometry(4, 4, 24)
  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.order = "YXZ";
  mesh.rotation.x = Math.PI / 2;

  return mesh;
}

function createHealth(color) {
  var material = new THREE.MeshBasicMaterial({ color: color,  wireframe: true });
  
  var vBar = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 16), material);
  var hBar = new THREE.Mesh(new THREE.BoxGeometry(4, 16, 4), material);

  var health = new THREE.Object3D();
  health.add(hBar);
  health.add(vBar);

  return health;
}

function createArmor(color) {
  var material = new THREE.MeshBasicMaterial({ color: color,  wireframe: true });
  
  var topPart = new THREE.Mesh(new THREE.BoxGeometry(16, 16, 36), material);
  topPart.position.y = 12

  var bottomPart = new THREE.Mesh(new THREE.BoxGeometry(20, 24, 24), material);

  var armor = new THREE.Object3D();
  armor.add(topPart);
  armor.add(bottomPart);

  return armor;
}

function createQuad(color) {
  var material = new THREE.MeshBasicMaterial({ color: color,  wireframe: true });
  
  var outerPart = new THREE.Mesh(new THREE.RingGeometry(24, 30, 32), material);
  var innerPart = new THREE.Mesh(new THREE.SphereGeometry(12, 8, 8), material);

  var quad = new THREE.Object3D();
  quad.add(outerPart);
  quad.add(innerPart);

  return quad;
}

function resolvePickupType(pickupType) {
  switch (pickupType) {
    case 0: // Burst
      return createWeapon(0x0099BB);
    case 1: // Shotgun
      return createWeapon(0xFF8800);
    case 2: // Grenade Launcher
      return createWeapon(0x008800);
    case 3: // Plasma Rifle
      return createWeapon(0xFF00FF);
    case 4: // Rocket Launcher
      return createWeapon(0xFF0000);
    case 5: // Ion Cannon
      return createWeapon(0x0000FF);
    case 6: // Bolt Rifle
      return createWeapon(0xFFFF00);
    case 7: // Stake
      return createWeapon(0x882200);

    case 40: //   5 Health
      return createHealth(0x00AA00);
    case 41: //  25 Health
      return createHealth(0xFFFF00)
    case 42: //  50 Health
      return createHealth(0xFF8800);
    case 43: // 100 Health
      return createHealth(0x0000FF);

    case 50: //   5 Armor
      return new THREE.Mesh(
        new THREE.BoxGeometry(10, 16, 2), 
        new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true})
      );
    case 51: // Green Armor
      return createArmor(0x008800);
    case 52: // Yellow Armor
      return createArmor(0xFFFF00);
    case 53: // Heavy Armor
      return createArmor(0xFF0000);
    case 60: // Quad Damage
      return createQuad(0x0000FF);
    default:
      var material = new THREE.MeshBasicMaterial({ color: 0xffffff,  wireframe: true });
      return new THREE.Mesh(new THREE.BoxGeometry(16,16,16), material);
  }  
}



module.exports = resolvePickupType;