"use strict";

import {readFileSync} from "fs";
import {writeFile} from "fs";
import {
  loadInstanceFromFile,
  instanceToString,
  boolArrayToString,
  indexSetToString,
  floatArrayToString
} from "./utils.mjs";
import {enumeration} from "./enumeration.mjs";
import {treeSearch} from "./treeSearch.mjs";
import {dynamicProgramming} from "./dynamicProgramming.mjs";
import {geneticAlgorithm} from "./geneticAlgorithm.mjs";
import {simplex} from "./simplex.mjs";
import {tabuSearch} from "./tabuSearch.mjs";

function testFile(filename) {
  let instance = null;
  console.log(filename);
  try {
    const string = readFileSync(filename, "utf8");
    instance = loadInstanceFromFile(string);
  } catch (error) {
    console.error("Error during file reading");
    process.exit(1);
  }
  console.log("File " + filename + " read successfully");

  let startTime = null;
  let endTime = null;
  let solution = null;
  let string = "";

  startTime = process.hrtime();
  solution = enumeration(instance);
  endTime = process.hrtime(startTime);
  string += endTime[0] + "s, " + (endTime[1] / 1000000) + "ms";

  startTime = process.hrtime();
  solution = treeSearch(instance);
  endTime = process.hrtime(startTime);
  string += endTime[0] + "s, " + (endTime[1] / 1000000) + "ms";

  startTime = process.hrtime();
  solution = dynamicProgramming(instance);
  endTime = process.hrtime(startTime);
  string += endTime[0] + "s, " + (endTime[1] / 1000000) + "ms";

  startTime = process.hrtime();
  solution = geneticAlgorithm(100, 100, 0.8, 0.2, instance);
  endTime = process.hrtime(startTime);
  string += endTime[0] + "s, " + (endTime[1] / 1000000) + "ms";

  startTime = process.hrtime();
  solution = tabuSearch(100, 10, instance);
  endTime = process.hrtime(startTime);
  string += endTime[0] + "s, " + (endTime[1] / 1000000) + "ms";

  startTime = process.hrtime();
  solution = simplex(100, instance);
  endTime = process.hrtime(startTime);
  string += endTime[0] + "s, " + (endTime[1] / 1000000) + "ms";

  return string;
}

let filename = "output.txt";
if (process.argv.length > 2) {
  filename = process.argv[2];
}

let testMode = false;
if (process.argv.length > 3 && process.argv[3] === "test") {
  testMode = true;
}

if (testMode) {
  console.log("TESTMODE");
  const testPath = "./tests/test";
  let string = "";
  for (let i = 0; i < 4; i++) {
    string += testFile(testPath + i + ".txt") + "\n";
  }
  writeFile(filename, string, (error) => {
    if (error) return console.log(error);
    console.log("File " + filename + " saved");
  });
} else {
  let instance = null;
  try {
    const string = readFileSync(filename, "utf8");
    instance = loadInstanceFromFile(string);
  } catch (error) {
    console.error("Error during file reading");
    process.exit(1);
  }
  console.log("File read successfully\n");
  
  console.log(instanceToString(instance));
  
  let startTime = null;
  let endTime = null;
  let solution = null;
  
  startTime = process.hrtime();
  solution = enumeration(instance);
  endTime = process.hrtime(startTime);
  console.log("Enumeration:\t\t" +
    boolArrayToString(solution, instance) +
    " in " + endTime[0] + "s, " + (endTime[1] / 1000000) + "ms"
  );
  
  startTime = process.hrtime();
  solution = treeSearch(instance);
  endTime = process.hrtime(startTime);
  console.log("Tree search:\t\t" +
    indexSetToString(solution, instance) +
    " in " + endTime[0] + "s, " + (endTime[1] / 1000000) + "ms"
  );
  
  startTime = process.hrtime();
  solution = dynamicProgramming(instance);
  endTime = process.hrtime(startTime);
  console.log("Dynamic programming:\t" +
    indexSetToString(solution, instance) +
    " in " + endTime[0] + "s, " + (endTime[1] / 1000000) + "ms"
  );
  
  startTime = process.hrtime();
  solution = geneticAlgorithm(100, 100, 0.8, 0.2, instance);
  endTime = process.hrtime(startTime);
  console.log("Genetic algorithm:\t" +
    boolArrayToString(solution, instance) +
    " in " + endTime[0] + "s, " + (endTime[1] / 1000000) + "ms"
  );
  
  startTime = process.hrtime();
  solution = tabuSearch(100, 10, instance);
  endTime = process.hrtime(startTime);
  console.log("Tabu search:\t\t" +
  boolArrayToString(solution, instance) +
  " in " + endTime[0] + "s, " + (endTime[1] / 1000000) + "ms"
  );
  
  startTime = process.hrtime();
  solution = simplex(100, instance);
  endTime = process.hrtime(startTime);
  console.log("Simplex method:\t\t" +
    floatArrayToString(solution, instance) +
    " in " + endTime[0] + "s, " + (endTime[1] / 1000000) + "ms"
  );
}