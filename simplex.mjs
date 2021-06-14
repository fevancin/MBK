"use strict";

import {
  floatArrayToString,
  instanceToString,
  createInstance,
  getValueFromFloatArray
} from "./utils.mjs";

export {
  simplex
};

function tableauToString(tableau, instance) {
  const n = instance.n;
  const k = instance.k;
  const rowNumber = n + k + 1;
  const columnNumber = n + n + k + 2;
  let string = "";
  for (let i = 0; i < rowNumber; i++) {
    for (let j = 0; j < columnNumber; j++) {
      string += Math.floor(tableau[i][j] * 100) / 100 + " ";
    }
    string += "\n";
  }
  return string;
}

function createTableau(instance) {
  const n = instance.n;
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  const m = instance.m;
  const tableau = [];
  const variableNumber = n + n + k + 1;
  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row[j] = w[i][j];
    }
    for (let j = n; j < variableNumber; j++) {
      row[j] = 0;
    }
    row[variableNumber] = m[i];
    tableau[i] = row;
  }
  for (let i = k; i < n + k; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row[j] = 0;
    }
    for (let j = n; j < variableNumber; j++) {
      row[j] = 0;
    }
    row[variableNumber] = 1;
    tableau[i] = row;
  }
  const lastRow = [];
  for (let j = 0; j < n; j++) {
    lastRow[j] = -v[j];
  }
  for (let j = n; j < variableNumber; j++) {
    lastRow[j] = 0;
  }
  lastRow[variableNumber] = 0;
  tableau[n + k] = lastRow;
  for (let i = 0; i < n; i++) {
    tableau[k + i][i] = 1;
  }
  for (let i = 0; i < n + k + 1; i++) {
    tableau[i][i + n] = 1;
  }
  return tableau;
}

function findPivotColumnIndex(tableau, instance) {
  const n = instance.n;
  const k = instance.k;
  const variableNumber = n; // quà sarebbe n + n + k...
  const tableauLastRow = tableau[n + k];
  let mostNegativeValue = tableauLastRow[0];
  let mostNegativeValueIndex = 0;
  for (let i = 1; i < variableNumber; i++) {
    const maybeValue = tableauLastRow[i];
    if (maybeValue < mostNegativeValue) {
      mostNegativeValue = maybeValue;
      mostNegativeValueIndex = i;
    }
  }
  if (mostNegativeValue >= 0) {
    return null;
  }
  return mostNegativeValueIndex;
}

function findPivotRowIndex(pivotColumnIndex, tableau, instance) {
  const n = instance.n;
  const k = instance.k;
  const variableNumber = n + n + k + 1;
  const tableauRowNumber = n + k;
  let smallestRatio = tableau[0][variableNumber] / tableau[0][pivotColumnIndex];
  let smallestRatioIndex = 0;
  for (let i = 1; i < tableauRowNumber; i++) {
    const maybeRatio = tableau[i][variableNumber] / tableau[i][pivotColumnIndex];
    if (maybeRatio > 0 && maybeRatio < smallestRatio) {
      smallestRatio = maybeRatio;
      smallestRatioIndex = i;
    }
  }
  return smallestRatioIndex;
}

function pivot(pivotRowIndex, pivotColumnIndex, tableau, instance) {
  const n = instance.n;
  const k = instance.k;
  const equationsNumber = n + k + 1;
  const variableNumber = n + n + k + 1;
  const pivotRow = tableau[pivotRowIndex];
  const pivotValue = pivotRow[pivotColumnIndex];
  for (let i = 0; i < equationsNumber; i++) {
    if (i === pivotRowIndex) {
      continue;
    }
    const row = tableau[i];
    const value = row[pivotColumnIndex];
    const multiplicationAmount = -value / pivotValue;
    for (let j = 0; j <= variableNumber; j++) {
      row[j] += pivotRow[j] * multiplicationAmount;
    }
  }
}

function extractSolution(tableau, instance) {
  const n = instance.n;
  const k = instance.k;
  const equationsNumber = n + k + 1;
  const variableNumber = n + n + k + 1;
  const array = [];
  for (let j = 0; j < n; j++) {
    let allZeros = true;
    for (let i = 0; i < equationsNumber; i++) {
      if (tableau[i][j] !== 0) {
        if (!allZeros) {
          array[j] = 0;
          continue;
        }
        allZeros = false;
        array[j] = tableau[i][variableNumber] / tableau[i][j];
      }
    }
  }
  return array;
}

function simplex(maxIterations, instance) {
  const tableau = createTableau(instance);
  for (let i = 0; i < maxIterations; i++) {
    const pivotColumnIndex = findPivotColumnIndex(tableau, instance);
    if (pivotColumnIndex === null) break;
    const pivotRowIndex = findPivotRowIndex(pivotColumnIndex, tableau, instance);
    pivot(pivotRowIndex, pivotColumnIndex, tableau, instance);
  }
  const array = extractSolution(tableau, instance);
  return array;
}

/* const instance = createInstance(5, 2, 9, 9);
console.log(instanceToString(instance));
const array = simplex(100, instance);
console.log(floatArrayToString(array, instance));
console.log("with value " + getValueFromFloatArray(array, instance)); */