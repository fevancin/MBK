"use strict";

import {writeFile} from "fs";
import {createInstance} from "./utils.mjs";

function writeInstanceToFile(instance, filename) {
  const n = instance.n;
  const k = instance.k;
  const w = instance.w;
  const v = instance.v;
  const m = instance.m;
  let string = "" + n + " " + k + "\n";
  for (let i = 0; i < n; i++) {
    string += v[i] + " ";
    for (let j = 0; j < k - 1; j++) {
      string += w[j][i] + " ";
    }
    string += w[k - 1][i] + "\n";
  }
  for (let i = 0; i < k - 1; i++) {
    string += m[i] + " ";
  }
  string += m[k - 1];
  writeFile(filename, string, (error) => {
    if (error) return console.log(error);
    console.log("File " + filename + " saved");
  });
}

let filename = "output.txt";
if (process.argv.length > 2) {
  filename = process.argv[2];
}
let n = 10;
if (process.argv.length > 3) {
  n = +process.argv[3];
}
let k = 2;
if (process.argv.length > 4) {
  k = +process.argv[4];
}
const instance = createInstance(n, k, 9, 9);
writeInstanceToFile(instance, filename);