function Cell(x, y, desirability, pheromones) {
	this.pos = new p5.Vector(x, y);
	this.key = vecKey(this.pos);
	this.desirability = desirability || 1;
	this.pheromones = pheromones || 0;
	this.isObstacle = false;
	// A combination of desirability and pheromones
	this.totalAttraction = 0;

	this.updateAttraction = () => {
			const {desirabilityFactor, pheromonesFactor} = appSettings;
			this.totalAttraction =
					Math.pow(this.desirability, desirabilityFactor) + Math.pow(this.pheromones, pheromonesFactor);
	};

	this.updateAttraction();
}

function Target(x, y, amount) {
	this.pos = new p5.Vector(x, y);
	this.amount = amount;
	this.originalAmount = amount;

	this.draw = () => {
			fill(100, 100, 200);
			square(this.pos.x * scale, this.pos.y * scale, scale);
	};
}

// I used this to develop the ant.chooseDestination function
// Not useful anymore but maybe at some point I'll use it again
function Test() {
	let ant = new Ant();

	let neighbors = [new Cell(0, 0, 1, 0), new Cell(2, 0, 1, 0), new Cell(1, 2, 1, 0)];
	neighbors.forEach((c, i) => (c.id = i));
	neighbors.forEach((c) => c.updateAttraction());

	console.log(neighbors);

	let res = neighbors.map((n) => 0);
	let totalTries = 10000;
	for (let i = 0; i < totalTries; i++) {
			chosenId = ant.chooseDestination(neighbors).id;
			res[chosenId]++;
	}

	console.log('result');
	console.log(res);
	console.log(res.map((v) => (v * 100) / totalTries));
	console.log(
			'control',
			res.map((v) => (v * 100) / totalTries).reduce((a, b) => (a += b))
	);

	console.log('=========================================================');
	console.log('END OF TESTS');
}
