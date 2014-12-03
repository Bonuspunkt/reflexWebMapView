function extractData(mapInfo) {
  
  var pickups = mapInfo.entities
    .filter(function(entity) { return entity.type === 'Pickup'; });

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

  var result = document.createElement('div');
  result.style.padding = '10px'

  var info = Object.keys(data).forEach(function(key) {
    var h3 = document.createElement('h3');
    h3.textContent = key;
    result.appendChild(h3)

    var subItems = data[key];
    Object.keys(subItems).forEach(function(subKey) {
      var subItem = document.createElement('div');
      subItem.textContent = subItems[subKey] + 'x ' + subKey;
      result.appendChild(subItem);
    });
  });

  return result;
}

module.exports = buildDom;
