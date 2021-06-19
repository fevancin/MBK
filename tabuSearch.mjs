"use strict";

import {
  getValueFromBoolArray
} from "./utils.mjs";

export {
  tabuSearch
};

function getRandomArray(instance) {
  const n = instance.n;
  const array = [];
  for (let i = 0; i < n; i++) {
    array[i] = (Math.random() > 0.5) ? true : false;
  }
  return array;
}

function areTheSame(array1, array2, instance) {
  const n = instance.n;
  for (let i = 0; i < n; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

function isInList(array, list, instance) {
  const listLength = list.length;
  for (let i = 0; i < listLength; i++) {
    if (areTheSame(array, list[i], instance)) {
      return true;
    }
  }
  return false;
}

function visitNeighbourhood(current, tabuList, instance) {
  const n = instance.n;
  let bestNeighbour = {
    array: [],
    value: -Infinity
  };
  for (let i = 0; i < n; i++) {
    const neighbour = {
      array: current.array.slice(),
      value: 0
    };
    neighbour.array[i] = !neighbour.array[i];
    if(isInList(neighbour.array, tabuList, instance)) {
      continue;
    }
    neighbour.value = getValueFromBoolArray(neighbour.array, instance);
    if (neighbour.value > bestNeighbour.value) {
      bestNeighbour.array = neighbour.array;
      bestNeighbour.value = neighbour.value;
    }
  }
  return bestNeighbour;
}

function tabuSearch(steps, tabuListMaxLength, instance) {
  let current = {
    array: getRandomArray(instance),
    value: 0
  };
  current.value = getValueFromBoolArray(current.array, instance);
  const best = {
    array: current.array,
    value: current.value
  };
  const tabuList = [];
  for (let i = 0; i < steps; i++) {
    current = visitNeighbourhood(current, tabuList, instance);
    if (current.value < 0) {
      current.array = getRandomArray(instance);
      current.value = getValueFromBoolArray(current.array, instance);
    }
    tabuList.push(current.array);
    if (tabuList.length > tabuListMaxLength) {
      tabuList.shift();
    }
    if (current.value > best.value) {
      best.array = current.array;
      best.value = current.value;
    }
  }
  return best.array;
}