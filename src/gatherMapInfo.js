var domRender = require('./domRender');

function extractData(mapInfo) {
  
  var pickups = mapInfo.entities
    .filter(function(entity) { return entity.type === 'Pickup'; });

  var spawns = mapInfo.entities
    .filter(function(entity) { return entity.type === 'PlayerSpawn'; });

  var teleports = mapInfo.entities
    .filter(function(entity) { return entity.type === 'Teleporter'; });

  var jumppads = mapInfo.entities
    .filter(function(entity) { return entity.type === 'JumpPad'; });

  var result = {
    weapons: {
      burst: 0,
      shotgun: 0,
      grenadeLauncher: 0,
      plasmaRifle: 0,
      rocketLauncher: 0,
      ionCannon: 0,
      boltRifle: 0,
      stake: 0
    },
    health: {
      '5hp': 0,
      '25hp': 0,
      '50hp': 0,
      '100hp': 0
    },
    armor: {
      shard: 0,
      green: 0,
      yellow: 0,
      red: 0
    },
    powerup: {
      quad: 0
    },
    other: {
      playerSpawns: spawns.length,
      teleports: teleports.length,
      jumppads: jumppads.length
    }
  };

  pickups.forEach(function(pickup) {

    switch (pickup.pickupType) {
      case 0: // Burst
        return result.weapons.burst++;
      case 1: // Shotgun
        return result.weapons.shotgun++;
      case 2: // Grenade Launcher
        return result.weapons.grenadeLauncher++;
      case 3: // Plasma Rifle
        return result.weapons.plasmaRifle++;
      case 4: // Rocket Launcher
        return result.weapons.rocketLauncher++;
      case 5: // Ion Cannon
        return result.weapons.ionCannon++;
      case 6: // Bolt Rifle
        return result.weapons.boltRifle++;
      case 7: // Stake
        return result.weapons.stake++

      case 40: //   5 Health
        return result.health['5hp']++;
      case 41: //  25 Health
        return result.health['25hp']++;
      case 42: //  50 Health
        return result.health['50hp']++;
      case 43: // 100 Health
        return result.health['100hp']++;

      case 50: //   5 Armor
        return result.armor.shard++;
      case 51: // Green Armor
        return result.armor.green++;
      case 52: // Yellow Armor
        return result.armor.yellow++;
      case 53: // Heavy Armor
        return result.armor.red++;
      
      case 60: // Quad Damage
        return result.powerup.quad++;
    }

  });

  return result;
}


function buildDom(mapInfo) {
  var data = extractData(mapInfo);

  return domRender({
    className: 'block',
    children: Object.keys(data).map(function(key) {
      return [{
        tagName: 'h3',
        children: [key]
      }].concat(
        Object.keys(data[key]).map(function(subKey) {
          return {
            children: [ data[key][subKey] + 'x ' + subKey ]
          }
        })
      );
    }).reduce(function(prev, curr) {
      return prev.concat(curr);
    })
  });
}

module.exports = buildDom;
