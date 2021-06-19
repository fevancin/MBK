"use strict";

import {
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
    return b.value - a.value;
  });
}

function selectParents(population) {
  const populationLength = population.length;
  const r1 = Math.random() * 0.04, r2 = Math.random() * 0.5;
  const randomIndex1 = Math.floor(r1 * populationLength);
  const randomIndex2 = Math.floor(r2 * populationLength);
  return [
    population[randomIndex1],
    population[randomIndex2]
  ];
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
  let population = generatePopulation(populationSize, instance);
  sortPopulation(population);
  let bestArray = population[0].array;
  let bestValue = -Infinity;
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