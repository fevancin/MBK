"use strict";

export {
  indexSetToString,
  boolArrayToString,
  floatArrayToString,
  instanceToString,
  createInstance,
  getValueFromIndexSet,
  getValueFromBoolArray,
  getValueFromFloatArray,
  fromBoolArrayToIndexSet,
  fromIndexSetToBoolArray,
  loadInstanceFromFile
};

function loadInstanceFromFile(string) {
  let n = 0;
  let k = 0;
  const w = [];
  const v = [];
  const m = [];
  const rows = string.split("\n");
  if (rows.length === 0) {
    console.log("Empty file");
    process.exit(0);
  }
  const firstRow = rows[0].split(" ");
  if (firstRow.length !== 2) {
    console.log("Wrong parameter number in the first line");
    process.exit(1);
  }
  n = parseInt(firstRow[0]);
  k = parseInt(firstRow[1]);
  if (isNaN(n) || isNaN(k)) {
    console.log("Error during the decoding of the first line");
    process.exit(1);
  }
  if (rows.length !== n + 2) {
    console.log("Wrong line number in file");
    process.exit(1);
  }
  for (let i = 0; i < k; i++) {
    w[i] = [];
  }
  for (let i = 1; i < n + 1; i++) {
    const row = rows[i].split(" ");
    if (row.length !== k + 1) {
      console.log("Wrong parameter number in line " + i);
      process.exit(1);
    }
    v.push(parseInt(row[0]));
    if (isNaN(v[i - 1])) {
      console.log("Error during the decoding of line " + i);
      process.exit(1);
    }
    for (let j = 1; j < k + 1; j++) {
      w[j - 1][i - 1] = parseInt(row[j]);
      if (isNaN(w[j - 1][i - 1])) {
        console.log("Error during the decoding of line " + i);
        process.exit(1);
      }
    }
  }
  const lastRow = rows[n + 1].split(" ");
  if (lastRow.length !== k) {
    console.log("Wrong parameter number in the last line");
    process.exit(1);
  }
  for (let i = 0; i < k; i++) {
    m.push(parseInt(lastRow[i]));
    if (isNaN(m[i])) {
      console.log("Error during the decoding of the last line");
      process.exit(1);
    }
  }
  return {
    n: n,
    k: k,
    w: w,
    v: v,
    m: m
  };
}

function indexSetToString(set = new Set(), instance) {
  const n = instance.n;
  let string = "";
  for (let j = 0; j < n; j++) {
    string += (set.has(j)) ? "1" : "0";
  }
  return "[" + string + "]";
}

function boolArrayToString(array = [], instance) {
  const n = instance.n;
  let string = "";
  for (let j = 0; j < n; j++) {
    string += (array[j]) ? "1" : "0";
  }
  return "[" + string + "]";
}

function floatArrayToString(array = [], instance) {
  const n = instance.n;
  let string = "";
  for (let j = 0; j < n - 1; j++) {
    string += Math.floor(array[j] * 1000) / 1000 + " ";
  }
  string += Math.floor(array[n - 1] * 1000) / 1000;
  return "[" + string + "]";
}

function createInstance(n = 0, k = 0, maxV = 0, maxM = 0) {
  const w = [];
  const v = [];
  const m = [];
  const maxMValue = Math.ceil(maxM * n * 0.25);
  for (let i = 0; i < k; i++) {
    w[i] = [];
    for (let j = 0; j < n; j++) {
      w[i][j] = Math.ceil(Math.random() * maxM);
    }
    m[i] = maxMValue;
  }
  for (let j = 0; j < n; j++) {
    v[j] = Math.ceil(Math.random() * maxV);
  }
  return {
    n: n, k: k, w: w, v: v, m: m
  };
}

function getValueFromIndexSet(set = new Set(), instance) {
  const n = instance.n;
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  const spaceRemaining = instance.m.slice();
  let value = 0;
  for (let j = 0; j < n; j++) {
    if (!set.has(j)) {
      continue;
    }
    value += v[j];
    for (let i = 0; i < k; i++) {
      spaceRemaining[i] -= w[i][j];
      if (spaceRemaining[i] < 0) {
        return -Infinity;
      }
    }
  }
  return value;
}

function getValueFromBoolArray(array = [], instance) {
  const n = instance.n;
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  const spaceRemaining = instance.m.slice();
  let value = 0;
  for (let j = 0; j < n; j++) {
    if (!array[j]) {
      continue;
    }
    value += v[j];
    for (let i = 0; i < k; i++) {
      spaceRemaining[i] -= w[i][j];
      if (spaceRemaining[i] < 0) {
        return -Infinity;
      }
    }
  }
  return value;
}

function getValueFromFloatArray(array = [], instance) {
  const n = instance.n;
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  const spaceRemaining = instance.m.slice();
  let value = 0;
  for (let j = 0; j < n; j++) {
    const amount = array[j];
    if (amount <= 0) {
      continue;
    }
    value += v[j] * amount;
    for (let i = 0; i < k; i++) {
      spaceRemaining[i] -= w[i][j] * amount;
      if (spaceRemaining[i] < -0.000001) {
        console.log("on " + j + ", " + i);
        return -Infinity;
      }
    }
  }
  return Math.floor(value * 1000) / 1000;
}

function instanceToString(instance) {
  const n = instance.n;
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  const m = instance.m;
  let string = "n = " + n + ", k = " + k + "\n";
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < n; j++) {
      string += w[i][j] + " ";
    }
    string += " <= " + m[i] + "\n";
  }
  for (let j = 0; j < n; j++) {
    string += v[j] + " ";
  }
  return string + "\n";
}

function fromIndexSetToBoolArray(set = new Set(), instance) {
  const n = instance.n;
  const array = [];
  for (let j = 0; j < n; j++) {
    array[j] = (set.has(j)) ? true : false;
  }
  return array;
}

function fromBoolArrayToIndexSet(array = [], instance) {
  const n = instance.n;
  const set = new Set();
  for (let j = 0; j < n; j++) {
    if(array[j]) {
      set.add(j);
    }
  }
  return set;
}