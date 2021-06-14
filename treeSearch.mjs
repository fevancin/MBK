"use strict";

import {
  indexSetToString,
  instanceToString,
  createInstance,
  getValueFromIndexSet
} from "./utils.mjs";

export {
  treeSearch
};

function treeSearch(instance) {
  const n = instance.n;
  const v = instance.v;
  const m = instance.m;
  const best = {
    set: [],
    value: 0
  };
  const remaining = [];
  let remainingValue = 0;
  for (let i = 0; i < n; i++) {
    remaining.push(i);
    remainingValue += v[i];
  }
  visit([], remaining, 0, remainingValue, m.slice(), best, instance);
  return new Set(best.set);
}

function visit(set, remaining, value, reamainingValue, remainingSpace, best, instance) {
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  while (remaining.length > 0) {
    const item = remaining.pop();
    const childRemainingSpace = [];
    let feasible = true;
    for (let i = 0; i < k; i++) {
      childRemainingSpace[i] = remainingSpace[i] - w[i][item];
      if (childRemainingSpace[i] < 0) {
        feasible = false;
        break;
      }
    }
    if (!feasible) continue;
    const childSet = set.slice();
    childSet.push(item);
    const itemValue = v[item];
    const childValue = value + itemValue;
    if (childValue > best.value) {
      best.set = childSet.slice();
      best.value = childValue;
    }
    const childReamainingValue = reamainingValue - itemValue;
    if (childReamainingValue + childValue <= best.value) continue;
    visit(childSet, remaining.slice(), childValue, childReamainingValue, childRemainingSpace, best, instance);
  }
}

/* const instance = createInstance(5, 2, 9, 9);
console.log(instanceToString(instance));
const set = treeSearch(instance);
console.log(indexSetToString(set, instance));
console.log("with value " + getValueFromIndexSet(set, instance)); */