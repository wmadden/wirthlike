import ndarray from "ndarray";
import ROT from "rot-js";

import {
  makeCreature,
} from "logic/creatures";

import {
  makeItem,
} from "logic/items";

const MAP_WIDTH = 80;
const MAP_HEIGHT = 40;

const BOSS_MAP_WIDTH = 20;
const BOSS_MAP_HEIGHT = 15;

function makeTile(type) {
  return {
    type,
  };
}

function randomPositionIn(room) {
  return [
    Math.floor(room.getLeft() + (room.getRight() - room.getLeft()) * Math.random()),
    Math.floor(room.getTop() + (room.getBottom() - room.getTop()) * Math.random()),
  ];
}

function setStairs(map, stairsDownPosition, stairsUpPosition) {
  /* eslint no-param-reassign:0 */
  if (stairsDownPosition) {
    map.stairsDownPosition = stairsDownPosition;
    map.set(stairsDownPosition[0], stairsDownPosition[1], makeTile("stairsDown"));
  }
  if (stairsUpPosition) {
    map.stairsUpPosition = stairsUpPosition;
    map.set(stairsUpPosition[0], stairsUpPosition[1], makeTile("stairsUp"));
  }
}

function setInitialPlayerPosition(map, x, y) {
  /* eslint no-param-reassign:0 */
  map.initialPlayerPosition = { x, y };
}

export function spawnEnemies(rooms) {
  return rooms.map((room) => {
    const position = randomPositionIn(room);
    return makeCreature("mutantRat", { x: position[0], y: position[1] });
  });
}

export function enterPreviousLevel(currentPlayerLevel) {
  return currentPlayerLevel.previousLevel;
}

export function bossLevel(id) {
  const map = ndarray([], [BOSS_MAP_WIDTH, BOSS_MAP_HEIGHT]);
  const rotMap = new ROT.Map.Arena(BOSS_MAP_WIDTH, BOSS_MAP_HEIGHT);
  map.id = id;
  map.width = BOSS_MAP_WIDTH;
  map.height = BOSS_MAP_HEIGHT;

  rotMap.create((x, y, wall) => {
    map.set(x, y, wall ? makeTile("wall") : makeTile("floor"));
  });
  setStairs(map, [1, 2]);
  setInitialPlayerPosition(map, 1, 2);
  map.creatures = [
    makeCreature("pestcontrol", {
      x: BOSS_MAP_WIDTH - 5, y: Math.floor(BOSS_MAP_HEIGHT / 2),
    }),
  ];

  return map;
}

export function makeMap(id) {
  const map = ndarray([], [MAP_WIDTH, MAP_HEIGHT]);

  function makeDoors(x, y) {
    map.set(x, y, makeTile("door"));
  }

  function getDoors(rooms) {
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      room.getDoors(makeDoors);
    }
  }

  function healingItemsOnLevel(rooms) {
    const amount = Math.floor(Math.random() * 2) + 1;
    const potions = [];
    for (let i = 0; i <= amount; i++) {
      const randomRoom = Math.floor(Math.random() * rooms.length);
      const position = randomPositionIn(rooms[randomRoom]);
      potions.push(makeItem("healingPotion", { x: position[0], y: position[1] }));
    }
    const position = randomPositionIn(rooms[0]);
    potions.push(makeItem("healingPotion", { x: position[0], y: position[1] }));
    map.items = potions;
  }

  const rotMap = new ROT.Map.Digger(MAP_WIDTH, MAP_HEIGHT, {
    roomWidth: [7, 12],
    roomHeight: [7, 13],
    dugPercentage: 0.5,
  });
  map.id = id || 0;
  map.width = MAP_WIDTH;
  map.height = MAP_HEIGHT;

  rotMap.create((x, y, wall) => {
    map.set(x, y, wall ? makeTile("wall") : makeTile("floor"));
  });

  const rooms = rotMap.getRooms();

  if (map.id !== 0) {
    setStairs(map, rooms[0].getCenter(), rooms[rooms.length - 1].getCenter());
  } else {
    setStairs(map, null, rooms[rooms.length - 1].getCenter());
  }

  setInitialPlayerPosition(map, rooms[0].getCenter()[0], rooms[0].getCenter()[1]);
  getDoors(rooms);
  healingItemsOnLevel(rooms);

  map.creatures = spawnEnemies(rooms);
  return map;
}

export function enterNextLevel(currentPlayerLevel) {
  if (!currentPlayerLevel.nextLevel) {
    let newLevel;

    if (currentPlayerLevel.id === 4) {
      newLevel = bossLevel(currentPlayerLevel.id + 1);
    } else {
      newLevel = makeMap(currentPlayerLevel.id + 1);
    }

    currentPlayerLevel.nextLevel = newLevel;
    newLevel.previousLevel = currentPlayerLevel;
    return newLevel;
  }

  return currentPlayerLevel.nextLevel;
}
