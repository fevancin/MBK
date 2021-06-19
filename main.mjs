"use strict";

import {
  readFileSync,
  writeFile
} from "fs";

import {
  loadInstanceFromFile,
  instanceToString,
  boolArrayToString,
  indexSetToString,
  floatArrayToString,
  getValueFromBoolArray,
  getValueFromIndexSet,
  getValueFromFloatArray
} from "./utils.mjs";

import {enumeration} from "./enumeration.mjs";
import {treeSearch} from "./treeSearch.mjs";
import {dynamicProgramming} from "./dynamicProgramming.mjs";
import {geneticAlgorithm} from "./geneticAlgorithm.mjs";
import {simplex} from "./simplex.mjs";
import {swarmSearch} from "./swarmSearch.mjs";
import {tabuSearch} from "./tabuSearch.mjs";

function testFile(filename) {
  let instance = null;
  try {
    const string = readFileSync(filename, "utf8");
    instance = loadInstanceFromFile(string);
  } catch (error) {
    console.error("Error during file reading");
    process.exit(1);
  }

  let startTime = null;
  let endTime = null;
  let solution = null;
  let string = "" + instance.n + "\t" + instance.k + " ->\t";

  if (instance.n > 25) {
    string += "---s\t";
  } else {
    startTime = process.hrtime();
    solution = enumeration(instance);
    endTime = process.hrtime(startTime);
    string += Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000 + "s\t";
  }

  if (instance.n > 30) {
    string += "---s\t";
  } else {
    startTime = process.hrtime();
    solution = treeSearch(instance);
    endTime = process.hrtime(startTime);
    string += Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000 + "s\t";
  }

  startTime = process.hrtime();
  solution = dynamicProgramming(instance);
  endTime = process.hrtime(startTime);
  string += Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000 + "s\t";

  startTime = process.hrtime();
  solution = geneticAlgorithm(100, 100, 0.8, 0.2, instance);
  endTime = process.hrtime(startTime);
  string += Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000 + "s\t";

  startTime = process.hrtime();
  solution = tabuSearch(100, 10, instance);
  endTime = process.hrtime(startTime);
  string += Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000 + "s\t";

  startTime = process.hrtime();
  solution = simplex(100, instance);
  endTime = process.hrtime(startTime);
  string += Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000 + "s\t";

  startTime = process.hrtime();
  solution = swarmSearch(100, 100, 0.8, 0.1, instance);
  endTime = process.hrtime(startTime);
  string += Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000 + "s";

  return string;
}

function testFileForValue(filename) {
  let instance = null;
  try {
    const string = readFileSync(filename, "utf8");
    instance = loadInstanceFromFile(string);
  } catch (error) {
    console.error("Error during file reading");
    process.exit(1);
  }

  let solution = null;
  let string = "" + instance.n + "\t" + instance.k + " ->\t";

  solution = dynamicProgramming(instance);string += getValueFromIndexSet(solution, instance) + "\t";

  solution = geneticAlgorithm(100, 100, 0.8, 0.2, instance);
  string += getValueFromBoolArray(solution, instance) + "\t";

  solution = tabuSearch(100, 10, instance);
  string += getValueFromBoolArray(solution, instance) + "\t";

  solution = simplex(100, instance);
  string += getValueFromFloatArray(solution, instance) + "\t";

  solution = swarmSearch(100, 100, 0.8, 0.1, instance);
  string += getValueFromBoolArray(solution, instance);
  
  return string;
}

if (process.argv.length > 2 && process.argv[2] === "test") {

  let n = 10;
  if (process.argv.length > 3) {
    n = process.argv[3];
  }

  let string = "n\tk\t\tDynamic\tGenetic\tTabu\tSimplex\tSwarm\n";
  for (let i = 1; i <= n; i++) {
    const filename = "./tests/test" + i + ".txt";
    console.log("Testing " + filename);
    string += testFile(filename) + "\n";
    // string += testFileForValue(filename) + "\n";
  }
  writeFile("./results.txt", string, (error) => {
    if (error) return console.log(error);
    console.log("File ./results.txt saved");
  });

} else {

  let filename = "output.txt";
  if (process.argv.length > 2) {
    filename = process.argv[2];
  }

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
  
  if (instance.n <= 25) {
    startTime = process.hrtime();
    const solution1 = enumeration(instance);
    endTime = process.hrtime(startTime);
    console.log("Enum:\t" +
      boolArrayToString(solution1, instance) +
      " in " + (Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000) + "s\t(" +
      getValueFromBoolArray(solution1, instance) + ")"
    );
  }
  
  startTime = process.hrtime();
  const solution2 = treeSearch(instance);
  endTime = process.hrtime(startTime);
  console.log("Tree:\t" +
    indexSetToString(solution2, instance) +
    " in " + (Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000) + "s\t(" +
    getValueFromIndexSet(solution2, instance) + ")"
  );
  
  startTime = process.hrtime();
  const solution3 = dynamicProgramming(instance);
  endTime = process.hrtime(startTime);
  console.log("Dynamic:" +
    indexSetToString(solution3, instance) +
    " in " + (Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000) + "s\t(" +
    getValueFromIndexSet(solution3, instance) + ")"
  );
  
  startTime = process.hrtime();
  const solution4 = geneticAlgorithm(100, 100, 0.8, 0.2, instance);
  endTime = process.hrtime(startTime);
  console.log("Genetic:" +
    boolArrayToString(solution4, instance) +
    " in " + (Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000) + "s\t(" +
    getValueFromBoolArray(solution4, instance) + ")"
  );
  
  startTime = process.hrtime();
  const solution5 = tabuSearch(100, 10, instance);
  endTime = process.hrtime(startTime);
  console.log("Tabu:\t" +
    boolArrayToString(solution5, instance) +
    " in " + (Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000) + "s\t(" +
    getValueFromBoolArray(solution5, instance) + ")"
  );

  startTime = process.hrtime();
  const solution6 = swarmSearch(100, 100, 0.8, 0.1, instance);
  endTime = process.hrtime(startTime);
  console.log("Swarm:\t" +
    boolArrayToString(solution6, instance) +
    " in " + (Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000) + "s\t(" +
    getValueFromBoolArray(solution6, instance) + ")"
  );
  
  startTime = process.hrtime();
  const solution7 = simplex(100, instance);
  endTime = process.hrtime(startTime);
  console.log("Simplex:" +
    floatArrayToString(solution7, instance) +
    " in " + (Math.floor(10000 * (endTime[0] + endTime[1] / 1000000000)) / 10000) + "s\t(" +
    getValueFromFloatArray(solution7, instance) + ")"
  );

}