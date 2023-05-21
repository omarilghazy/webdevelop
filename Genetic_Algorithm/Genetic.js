
function calculateFitness() {
    let currentRecord = Infinity;
    for (let i = 0; i < population.length; i++) {
      const d = calcDistance(cities, population[i]);
      // console.log("population : ", population[i]);
      if (d < geneticRecorDistance) {
        geneticRecorDistance = d;
        //console.log("calc fitness population : ", population[i].length);
        bestEver = population[i];
      }
      if (d < currentRecord) {
        currentRecord = d;
        // console.log("calc fitness population : ", population[i].length);
        currentBest = population[i];
      }
  
      fitness[i] = 1 / (pow(d, 8) + 1);
      // console.log(fitness);
    }
    // console.log("in ga.js ", bestEver.length);
  }
  
  let stop_counter = 0;
  let cumulative_sum = 0;
  let comapare_sum = 0;
  
  function normalizeFitness() {
    let sum = 0;
    
    for (let i = 0; i < fitness.length; i++) {
      sum += fitness[i];
    }
    for (let i = 0; i < fitness.length; i++) {
      fitness[i] = fitness[i] / sum;
    }
  
    // console.log("Difference : ", ((cumulative_sum + sum) - cumulative_sum))
  
    // if (((cumulative_sum + sum) - cumulative_sum) < (cumulative_sum*10)){
    //   stop_counter++;
    //   if (stop_counter > 500){
    //     noLoop();
    //   }
    // }else{
    //   stop_counter = 0;
    // }
  
    if (totalCities/10 > 4){
      stoppingDecimal = -Math.abs(4);
    }else{
      stoppingDecimal = -Math.abs(Math.ceil(totalCities / 10));
    }
  
    console.log(stoppingDecimal);
  
    if(sum/cumulative_sum < Math.pow(10, stoppingDecimal)){
      noLoop();
    }
  
    cumulative_sum = cumulative_sum + sum;
    // console.log(cumulative_sum);
    console.log("Factor : ", sum/cumulative_sum);
  }
  
  function nextGeneration() {
    const newPopulation = [];
    for (var i = 0; i < population.length; i++) {
      const orderA = pickOne(population, fitness);
      const orderB = pickOne(population, fitness);
      const order = crossOver(orderA, orderB);
      mutate(order, 0.03);
      newPopulation[i] = order;
    }
    population = newPopulation;
  
  }
  
  function pickOne(list, prob) {
    let index = 0;
    let r = random(1);
  
    while (r > 0) {
      r = r - prob[index];
      index++;
    }
    index--;
    return list[index].slice();
  }
  
  function crossOver(orderA, orderB) {
    const start = floor(random(orderA.length));
    const end = floor(random(start + 1, orderA.length));
    const neworder = orderA.slice(start, end);
    for (let i = 0; i < orderB.length; i++) {
      const city = orderB[i];
      if (!neworder.includes(city)) {
        neworder.push(city);
      }
    }
    return neworder;
  }
  
  
  function mutate(order, mutationRate) {
    for (let i = 0; i < totalCities; i++) {
      if (random(1) < mutationRate) {
        const indexA = floor(random(order.length));
        const indexB = (indexA + 1) % totalCities;
        swap(order, indexA, indexB);
      }
    }
  }
