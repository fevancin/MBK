"use strict";

import {
  boolArrayToString,
  instanceToString,
  createInstance,
  getValueFromBoolArray
} from "./utils.mjs";

export {
  geneticAlgorithm
};

function generateIndividual(instance) {
  const n = instance.n;
  const array = [];
  for (let j = 0; j < n; j++) {
    array[j] = (Math.random() > 0.5) ? true : false;
  }
  const value = getValueFromBoolArray(array, instance);
  return {
    array: array,
    value: value
  };
}

function generatePopulation(populationSize, instance) {
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    population[i] = generateIndividual(instance);
  }
  return population;
}

function sortPopulation(population) {
  population.sort((a, b) => {
    return a.value - b.value;
  });
}

function crossoverIndividuals(parents, crossoverPercentage, instance) {
  const n = instance.n;
  const childArray1 = [], childArray2 = [];
  const parentArray1 = parents[0].array, parentArray2 = parents[1].array;
  for (let j = 0; j < n; j++) {
    if (Math.random() < crossoverPercentage) {
      childArray1[j] = parentArray1[j];
      childArray2[j] = parentArray2[j];
    } else {
      childArray1[j] = parentArray2[j];
      childArray2[j] = parentArray1[j];
    }
  }
  return [
    {array: childArray1},
    {array: childArray2}
  ];
}

function selectParents(population) {
  const populationLength = population.length;
  const r1 = Math.random(), r2 = Math.random();
  const randomIndex1 = Math.floor(r1 * r1 * populationLength);
  const randomIndex2 = Math.floor(r2 * r2 * populationLength);
  return [
    population[randomIndex1],
    population[randomIndex2]
  ];
}

function crossoverStep(population, crossoverPercentage, instance) {
  const populationLength = population.length;
  const newPopulation = [];
  while (newPopulation.length < populationLength) {
    const parents = selectParents(population);
    const children = crossoverIndividuals(parents, crossoverPercentage, instance);
    newPopulation.push(...children);
  }
  return newPopulation;
}

function mutateIndividual(individual, instance) {
  const n = instance.n;
  const randomIndex = Math.floor(Math.random() * n);
  individual.array[randomIndex] = !individual.array[randomIndex];
  individual.value = getValueFromBoolArray(individual.array, instance);
}

function mutationStep(population, mutationPercentage, instance) {
  const populationLength = population.length;
  const numberOfMutations = Math.floor(populationLength * mutationPercentage);
  for (let i = 0; i < numberOfMutations; i++) {
    const randomIndex = Math.floor(Math.random() * populationLength);
    mutateIndividual(population[randomIndex], instance);
  }
}

function geneticAlgorithm(populationSize, generationAmount, crossoverPercentage, mutationPercentage, instance) {
  let bestArray = null;
  let bestValue = -Infinity;
  let population = generatePopulation(populationSize, instance);
  sortPopulation(population);
  for (let i = 0; i < generationAmount; i++) {
    population = crossoverStep(population, crossoverPercentage, instance);
    mutationStep(population, mutationPercentage, instance);
    sortPopulation(population);
    const bestIndividual = population[0];
    if (bestIndividual.value > bestValue) {
      bestArray = bestIndividual.array;
      bestValue = bestIndividual.value;
    }
  }
  return bestArray;
}

/* const instance = createInstance(5, 2, 9, 9);
console.log(instanceToString(instance));
const array = geneticAlgorithm(100, 100, 0.8, 0.2, instance);
console.log(boolArrayToString(array, instance));
console.log("with value " + getValueFromBoolArray(array, instance)); */