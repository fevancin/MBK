"use strict";

import {
  getValueFromBoolArray
} from "./utils.mjs";

export {
  enumeration
};

function createInitialBoolArray(instance) {
  const n = instance.n;
  const array = [];
  for (let j = 0; j < n; j++) {
    array[j] = false;
  }
  return array;
}

function getNextBoolArray(array, instance) {
  const n = instance.n;
  let i = 0;
  while (i < n) {
    if (!array[i]) {
      array[i] = true;
      break;
    }
    array[i] = false;
    i++;
  }
  return array;
}

function enumeration(instance) {
  const n = instance.n;
  const numSolutions = 2 ** n - 1;
  let bestArray = null;
  let bestValue = -Infinity;
  let array = createInitialBoolArray(instance);
  for (let i = 0; i < numSolutions; i++) {
    const value = getValueFromBoolArray(array, instance);
    if (value >= bestValue) {
      bestArray = array.slice();
      bestValue = value;
    }
    array = getNextBoolArray(array, instance);
  }
  return bestArray;
}