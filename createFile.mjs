"use strict";

import {
  createInstance,
  writeInstanceToFile
} from "./utils.mjs";

if (process.argv.length > 2 && process.argv[2] === "test") {

  let n = 10;
  if (process.argv.length > 3) {
    n = +process.argv[3];
  }

  for (let i = 1; i <= n; i++) {
    const instance = createInstance(Math.floor((i / n) * 25 + 5), 2, 9, 9);
    //const instance = createInstance(32, 2, 9, i * 10);
    writeInstanceToFile(instance, "./tests/test" + i + ".txt");
  }
  console.log("Wrote " + n + " files in ./tests");

} else {

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

  const instance = createInstance(n, k, 100, 100);
  writeInstanceToFile(instance, filename);
  console.log("Wrote " + filename);

}