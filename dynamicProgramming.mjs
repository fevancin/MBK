"use strict";

import {
  indexSetToString,
  instanceToString,
  createInstance,
  getValueFromIndexSet
} from "./utils.mjs";

export {
  dynamicProgramming
};

function createMatrix(instance) {
  const m = instance.m;
  const matrix = [];
  for (let j = 0; j < 2; j++) {
    const row = [];
    for (let i = 0; i <= m[0]; i++) {
      const row2 = [];
      for (let l = 0; l <= m[1]; l++) {
        row2[l] = {set: new Set(), value: 0};
      }
      row[i] = row2;
    }
    matrix[j] = row;
  }
  return matrix;
}

function loadMatrix(matrix, instance) {
  const n = instance.n;
  const w = instance.w;
  const v = instance.v;
  const m = instance.m;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i <= m[0]; i++) {
      for (let l = 0; l <= m[1]; l++) {
        if (w[0][j] > i || w[1][j] > l) {
          const cellPrev = matrix[0][i][l];
          const cellNext = matrix[1][i][l];
          cellNext.value = cellPrev.value;
          cellNext.set = cellPrev.set;
        } else {
          const cellPrev = matrix[0][i][l];
          const cellNext = matrix[1][i][l];
          const cellMaybe = matrix[0][i - w[0][j]][l - w[1][j]];
          if (cellPrev.value > cellMaybe.value + v[j]) {
            cellNext.value = cellPrev.value;
            cellNext.set = cellPrev.set;
          } else {
            cellNext.value = cellMaybe.value + v[j];
            cellNext.set = new Set(cellMaybe.set);
            cellNext.set.add(j);
          }
        }
      }
    }
    const temp = matrix[0];
    matrix[0] = matrix[1];
    matrix[1] = temp;
  }
}

function dynamicProgramming(instance) {
  if (instance.k !== 2) {
    console.log("Only instances with k = 2");
    return;
  }
  const m = instance.m;
  const matrix = createMatrix(instance);
  loadMatrix(matrix, instance);
  return matrix[0][m[0]][m[1]].set;
}

/* const instance = createInstance(5, 2, 9, 9);
console.log(instanceToString(instance));
const set = dynamicProgramming(instance);
console.log(indexSetToString(set, instance));
console.log("with value " + getValueFromIndexSet(set, instance)); */