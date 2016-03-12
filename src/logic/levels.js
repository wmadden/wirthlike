import ndarray from "ndarray";
import ROT from "rot-js";

const MAP_WIDTH = 80;
const MAP_HEIGHT = 40;

function makeTile(type) {
  return {
    type,
  };
}

export function enterNextLevel(currentPlayerLevel) {
  if (!currentPlayerLevel.nextLevel) {
    let newLevel = makeMap(currentPlayerLevel.id + 1);
    currentPlayerLevel.nextLevel = newLevel;
    newLevel.previousLevel = currentPlayerLevel;
    return newLevel;
  } else {
    return currentPlayerLevel.nextLevel;
  }
}
export function enterPreviousLevel(currentPlayerLevel) {
  return currentPlayerLevel.previousLevel;
}

export function makeMap(id) {
  let map = ndarray([], [MAP_WIDTH, MAP_HEIGHT]);
  let rotMap = new ROT.Map.Digger(MAP_WIDTH, MAP_HEIGHT, {roomWidth: [7, 12], roomHeight: [7, 13], dugPercentage: 0.5});
  map.rotMap = rotMap;
  map.id = id || 0;

  rotMap.create(function (x, y, wall) {
    map.set(x, y, wall ? makeTile("wall") : null);
  });
  setStairs(map);
  return map;
}

function setStairs(map) {
  let rotMap = map.rotMap;
  let rooms = rotMap.getRooms();
  if(map.id !== 0) {
    var stairsDownPosition = rooms[0].getCenter();
    map.stairsDownPosition = stairsDownPosition;
    map.set(stairsDownPosition[0], stairsDownPosition[1], makeTile("stairsDown"));
  }
  if(map.id !== 4) {
    var stairsUpPosition = rooms[rooms.length - 1].getCenter();
    map.stairsUpPosition = stairsUpPosition;
    map.set(stairsUpPosition[0], stairsUpPosition[1], makeTile("stairsUp"));
  }
}
