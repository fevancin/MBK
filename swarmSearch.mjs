"use strict";

import {
  getValueFromBoolArray,
  loadInstanceFromFile,
  boolArrayToString
} from "./utils.mjs";

export {
  swarmSearch
};

function generateIndividual(instance) {
  const n = instance.n;
  const array = [];
  for (let i = 0; i < n; i++) {
    array[i] = Math.random();
  }
  const boolArray = getBoolArrayFromArray(array, instance);
  const value = getValueFromBoolArray(boolArray, instance);
  return {
    array: array,
    best: {
      array: array.slice(),
      boolArray: boolArray,
      value: value
    }
  };
}

function generateSwarm(swarmLength, instance) {
  const swarm = [];
  for (let i = 0; i < swarmLength; i++) {
    swarm[i] = generateIndividual(instance);
  }
  return swarm;
}

function getBoolArrayFromArray(array, instance) {
  const n = instance.n;
  const boolArray = [];
  for (let i = 0; i < n; i++) {
    boolArray[i] = (Math.random() > array[i]) ? true : false;
  }
  return boolArray;
}

function findBest(swarm, swarmLength) {
  let best = {
    array: [],
    boolArray: [],
    value: -Infinity
  };
  for (let i = 0; i < swarmLength; i++) {
    const individual = swarm[i];
    if (individual.best.value >= best.value) {
      best = individual.best;
    }
  }
  return best;
}

function moveIndividual(individual, inertiaPercentage, socialPercentage, best, instance) {
  const n = instance.n;
  const array = individual.array;
  const bestAllArray = best.array;
  const bestArray = individual.best.array;
  for (let i = 0; i < n; i++) {
    array[i] = array[i] * inertiaPercentage + bestAllArray[i] * socialPercentage + (1 - inertiaPercentage - socialPercentage) * bestArray[i];
  }
}

function repair(boolArray, instance) {
  const n = instance.n;
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  const m = instance.m.slice();
  const rank = [];
  for (let i = 0; i < n; i++) {
    let biggestW = w[0][i];
    for (let j = 1; j < k; j++) {
      if (w[j][i] > biggestW) {
        biggestW = w[j][i];
      }
    }
    rank[i] = v[i] / biggestW;
  }
  for (let i = 0; i < n; i++) {
    if (boolArray[i]) {
      for (let j = 0; j < k; j++) {
        m[j] -= w[j][i];
      }
    }
  }
  let feasible = true;
  for (let i = 0; i < k; i++) {
    if (m[i] < 0) {
      feasible = false;
      break;
    }
  }
  while (!feasible) {
    let bestIndex = 0;
    let bestRank = rank[0];
    for (let i = 1; i < n; i++) {
      if (boolArray[i] && rank[i] < bestRank) {
        bestIndex = i;
        bestRank = rank[i];
      }
    }
    boolArray[bestIndex] = false;
    for (let i = 0; i < k; i++) {
      m[i] += w[i][bestIndex];
    }
    feasible = true;
    for (let i = 0; i < k; i++) {
      if (m[i] < 0) {
        feasible = false;
        break;
      }
    }
  }
}

function swarmSearch(iterationNumber, swarmLength, inertiaPercentage, socialPercentage, instance) {
  const swarm = generateSwarm(swarmLength, instance);
  let best = findBest(swarm, swarmLength);
  for (let i = 0; i < iterationNumber; i++) {
    for (let j = 0; j < swarmLength; j++) {
      const individual = swarm[j];
      moveIndividual(individual, inertiaPercentage, socialPercentage, best, instance);
      const boolArray = getBoolArrayFromArray(individual.array, instance);
      repair(boolArray, instance);
      const value = getValueFromBoolArray(boolArray, instance);
      if (value > individual.best.value) {
        individual.best = {
          array: individual.array.slice(),
          boolArray: boolArray,
          value: value
        };
        if (value > best.value) {
          best = {
            array: individual.array.slice(),
            boolArray: boolArray,
            value: value
          };
        }
      }
    }
  }
  return best.boolArray;
}