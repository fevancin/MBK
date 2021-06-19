"use strict";

export {
  treeSearch
};

function visit(set, remaining, value, remainingValue, remainingSpace, best, instance) {
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
    const childRemainingValue = remainingValue - itemValue;
    if (childRemainingValue + childValue <= best.value) continue;
    visit(childSet, remaining.slice(), childValue, childRemainingValue, childRemainingSpace, best, instance);
  }
}

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