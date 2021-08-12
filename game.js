
/**
 * This game is very basic
 *   You have a player who's only mission is to get to a piece of food
 */

let spiral = [];
let start = new Vector(60, 50);
let angle = Math.PI / 2;
let mvt = 5;
for (var i = 0; i < 100; i++) {
    let next = new Vector(start.x + Math.cos(angle) * mvt, start.y + Math.sin(angle) * mvt);
    spiral.push(new Wall(start.x, start.y, next.x, next.y));
    angle += 0.35;
    mvt += 0.15;
    start = next;
}
spiral.push(new Wall(0, 0, 100, 0));
spiral.push(new Wall(100, 0, 100, 100));
spiral.push(new Wall(100, 100, 0, 100));
spiral.push(new Wall(0, 100, 0, 0));

 function setMap(map) {
    switch (map) {
        case "blank":
            game.walls = [
                new Wall(0, 0, 100, 0),
                new Wall(100, 0, 100, 100),
                new Wall(100, 100, 0, 100),
                new Wall(0, 100, 0, 0),
            ];
            break;
        case "diagonal":
            game.walls = [
                new Wall(0, 0, 100, 0),
                new Wall(100, 0, 100, 100),
                new Wall(100, 100, 0, 100),
                new Wall(0, 100, 0, 0),
                new Wall(20, 20, 80, 80)
            ];
            break;
        case "x marks the spot":
            game.walls = [
                new Wall(0, 0, 100, 0),
                new Wall(100, 0, 100, 100),
                new Wall(100, 100, 0, 100),
                new Wall(0, 100, 0, 0),
                new Wall(20, 20, 80, 80),
                new Wall(20, 80, 80, 20)
            ];
            game.food = new Vector(50, 40);
            break;
        case "cross":
            game.walls = [
                new Wall(0, 0, 100, 0),
                new Wall(100, 0, 100, 100),
                new Wall(100, 100, 0, 100),
                new Wall(0, 100, 0, 0),
                new Wall(50, 20, 50, 80),
                new Wall(20, 50, 80, 50)
            ];
            break;
        case "cross x":
            game.walls = [
                new Wall(0, 0, 100, 0),
                new Wall(100, 0, 100, 100),
                new Wall(100, 100, 0, 100),
                new Wall(0, 100, 0, 0),
                new Wall(20, 20, 80, 80),
                new Wall(20, 80, 80, 20),
                new Wall(50, 20, 50, 80),
                new Wall(20, 50, 80, 50)
            ];
            break;
        case "spiral":
            game.walls = spiral;
            game.food = new Vector(50, 50);
            break;
    }
}

function Player(x, y, lookAngle=0) {
    this.position = new Vector(x, y);
    this.speed = 0;
    this.lookAngle = lookAngle;

    this.hasWon = false;
    this.timer = 0;
}

Player.prototype.moveForward = function(amount) {
    if (!this.hasWon)
        this.speed += amount;
}

Player.prototype.moveBackward = function(amount) {
    if (!this.hasWon)
        this.speed -= amount;
}

Player.prototype.turnLeft = function(amount) {
    if (!this.hasWon)
        this.lookAngle -= amount;
}

Player.prototype.turnRight = function(amount) {
    if (!this.hasWon)
        this.lookAngle += amount;
}

Player.prototype.update = function(dt, game) {
    this.speed *= 0.96;

    let nx = this.position.x + Math.cos(this.lookAngle) * this.speed * dt;
    let ny = this.position.y + Math.sin(this.lookAngle) * this.speed * dt;

    let next = new Vector(nx, ny);

    let canMove = true;
    game.walls.forEach(wall => {
        let intersection = intersects(next, this.position, wall.point1, wall.point2);
        if (intersection != null) {
            canMove = false;
            this.speed = 0;
            return;
        }
    });
    if (canMove) {
        this.position = next;
    }

    if (this.position.distanceSquared(game.food) < 10) {
        // player has won.
        this.hasWon = true;
    }

    if (!this.hasWon)
        this.timer += dt;
}

Player.prototype.distanceToWall = function(walls, angleOffset) {
    // generate a line segment to check collision against
    let next = new Vector(this.position.x + Math.cos(this.lookAngle + angleOffset) * 1000, this.position.y + Math.sin(this.lookAngle + angleOffset) * 1000);
    let closest = 99999999999;
    walls.forEach(wall => {
        let intersection = intersects(this.position, next, wall.point1, wall.point2);
        if (intersection != null) {
            let d = intersection.distanceSquared(this.position);
            if (d < closest)
                closest = d;
        }
    });
    return Math.sqrt(closest);
}

Player.prototype.draw = function(ctx, width, height, color="blue") {
    // draw the player
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(game.mapX(this.position.x, width), game.mapY(this.position.y, height));
    ctx.lineTo(game.mapX(this.position.x + Math.cos(this.lookAngle) * 4, width), game.mapY(this.position.y + Math.sin(this.lookAngle) * 4, height));
    ctx.stroke();
    ctx.fillStyle = this.hasWon ? 'yellow' : color;
    ctx.beginPath();
    ctx.arc(game.mapX(this.position.x, width), game.mapY(this.position.y, height), 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = this === population[playerFocus].player ? "cyan" : "rgb(33, 33, 255)";
    ctx.stroke();
}

function Wall(x1, y1, x2, y2) {
    this.point1 = new Vector(x1, y1);
    this.point2 = new Vector(x2, y2);
}

/**
 * Creates a Game class that holds data for a player and a piece of food
 */
function Game() {
    this.mapSize = 100;
    this.food = new Vector(80, 20);
    this.walls = [
        new Wall(0, 0, 100, 0),
        new Wall(100, 0, 100, 100),
        new Wall(100, 100, 0, 100),
        new Wall(0, 100, 0, 0),
        new Wall(20, 20, 80, 80)
    ];
}

Game.prototype.mapX = function(x, width) {
    return x / this.mapSize * width;
}

Game.prototype.mapY = function(y, height) {
    return y / this.mapSize * height;
}

Game.prototype.render = function(ctx, width, height) {
    // draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // draw food
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(this.mapX(this.food.x, width), this.mapY(this.food.y, height), 10, 0, 2 * Math.PI);
    ctx.fill();
    
    // draw walls
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    this.walls.forEach(wall => {
        ctx.beginPath();
        ctx.moveTo(this.mapX(wall.point1.x, width), this.mapY(wall.point1.y, height));
        ctx.lineTo(this.mapX(wall.point2.x, width), this.mapY(wall.point2.y, height));
        ctx.stroke();
    });
}

keyboard = new Map();
function keyDown(keyCode) {
    return keyboard.has(keyCode) && keyboard.get(keyCode);
}
document.addEventListener("keydown", function(e) {
    keyboard.set(e.code, true);
    if (e.code == "ArrowRight") {
        playerFocus = (playerFocus +  1) % population.length;
    } else  if (e.code == "ArrowLeft") {
        playerFocus--;
        if (playerFocus < 0)
            playerFocus = population.length - 1;
    } else if (e.code == "Enter") {
        nextGeneration();
    } else if (e.code == "KeyB") {
        chooseBest();
    }
});
document.addEventListener("keyup", function(e) {
    keyboard.set(e.code, false);
});

var game = new Game();

var data = new Map();
data.set("Distance to Food", {func: (player) => { return formatNumber(player.position.distance(game.food), 2); }});
data.set("Rate Change Dist. To Food", {func: (player) => {
    const originalDistance = player.position.distance(game.food);
    let newPos = new Vector(player.position.x + Math.cos(player.lookAngle) * player.speed, player.position.y + Math.sin(player.lookAngle) * player.speed);
    const newDist = newPos.distance(game.food);
    return formatNumber(newDist - originalDistance, 2);
}});
data.set("Distance to Wall (0 deg)", {func: (player) => { return formatNumber(player.distanceToWall(game.walls, 0), 2); }});
data.set("Distance to Wall (45 deg left)", {func: (player) => { return formatNumber(player.distanceToWall(game.walls, -Math.PI / 4), 2); }});
data.set("Distance to Wall (90 deg left)", {func: (player) => { return formatNumber(player.distanceToWall(game.walls, -Math.PI / 2), 2); }});
data.set("Distance to Wall (45 deg right)", {func: (player) => { return formatNumber(player.distanceToWall(game.walls, Math.PI / 4), 2); }});
data.set("Distance to Wall (90 deg right)", {func: (player) => { return formatNumber(player.distanceToWall(game.walls, Math.PI / 2), 2); }});
data.set("Speed", {func: (player) => { return formatNumber(player.speed, 2); }});


const dataTag = document.getElementById("input-data");
const fitnessTag = document.getElementById("fitness");
const generationTag = document.getElementById("generation-info");

const popSizeInput = document.getElementById("popsize");
const mutRateInput = document.getElementById("mutrate");
const mutRangeInput = document.getElementById("mutrange");
const speedInput = document.getElementById("speed");
const mapInput = document.getElementById("mapselection");
const timeInput = document.getElementById("time");
const colorInput = document.getElementById("color");
const followInput = document.getElementById("followbest");

var generation = 1;
var population = [];
var timer = 0;
var fitnessData = []; // stores average fitness of each generation
var bestFitnessData = [];
reset();

function reset() {
    timer = 0;
    generation = 1;
    population = [];
    fitnessData = [];
    bestFitnessData = [];
    for (var i = 0; i < +popSizeInput.value; i++) 
        population.push(new NeuralNetwork());
    generationTag.innerHTML = "Pop. Size: " + popSizeInput.value + "<br>Generation: " + generation;
}


/**
 * Selects the top 10% individuals to breed randomly.
 * The top 10% also reproduce copies of themselves.
 */
function nextGeneration() {
    fitnessData.push(getAverageFitness());
    bestFitnessData.push(getBestFitness());

    const count = Math.ceil(0.1 * population.length);
    let best = [];
    while (best.length < count) {
        // find the best available indiviudal
        let bestIndividual = population[0];
        let bestFitness = bestIndividual.calculateFitness();
        population.forEach(individual => {
            let fitness = individual.calculateFitness();
            if (fitness < bestFitness) {
                bestIndividual = individual;
                bestFitness = fitness;
            }
        });
        best.push(bestIndividual);
        population.splice(population.indexOf(bestIndividual), 1);
    }

    population = [];
    for (var i = 0; i < count * 9; i++) {
        // implement method of 1 of reproduction
        // choose two different parents
        let idx1 = Math.floor(Math.random() * best.length);
        let idx2;
        do {
            idx2 = Math.floor(Math.random() * best.length);
        } while (idx2 == idx1);
        population.push(new NeuralNetwork(best[idx1], best[idx2]));
    }
    best.forEach(ind => {
        population.push(ind.clone());
    });
    
    generation += 1;
    generationTag.innerHTML = "Pop. Size: " + population.length + "<br>Generation: " + generation;
}

function colorFunction(value) {
    let red = (Math.sin(value * 0.96 + 0.34) + 1) / 2 * 255;
    let green = (Math.sin(value * 0.92 + 1.79) + 1) / 2 * 255;
    let blue = (Math.sin(value * 0.94 + 3.88) + 1) / 2 * 255;
    return `rgb(${red}, ${green}, ${blue})`;
}

function getAverageFitness() {
    let avg = 0;
    population.forEach(individual => {
        avg += individual.calculateFitness();
    });
    avg /= population.length;
    return avg;
}

function getBestFitness() {
    let bestFitness = population[0].calculateFitness();
    for (var i = 1; i < population.length; i++) {
        let fit = population[i].calculateFitness();
        if (fit < bestFitness) bestFitness = fit;
    }
    return bestFitness;
}

function chooseBest() {
    // find the index of the current individual with the best fitness
    let best = 0;
    let bestFitness = population[best].calculateFitness();
    for (var i = 1; i < population.length; i++) {
        let fit = population[i].calculateFitness();
        if (fit < bestFitness) {
            bestFitness = fit;
            best = i;
        }
    }
    playerFocus = best;
}

data.forEach((data, header) => {
    let row = document.createElement("tr");
    let headerElement = document.createElement("td");
    headerElement.innerHTML = header;
    row.appendChild(headerElement);
    data.tag = document.createElement("td");
    row.appendChild(data.tag);
    dataTag.appendChild(row);
});

var playerFocus = 0;

function drawGraph(dataValues, min, max, color="black") {
    let prev = [];
    for (var i = 0; i < dataValues.length; i++) {
        var x = 0.05 + 0.9 * (i / (dataValues.length - 1));
        var y = 0.95 - 0.9 * ((dataValues[i] - min) / (max - min));
        x *= graphWidth;
        y *= graphHeight;
        if (prev.length > 0) {
            grctx.strokeStyle = color;
            grctx.beginPath();
            grctx.moveTo(prev[0], prev[1]);
            grctx.lineTo(x, y);
            grctx.stroke();
        }
        prev = [x, y];
    }
}

function gameLoop() {
    if (keyDown("KeyW")) 
        population[playerFocus].player.moveForward(2);
    if (keyDown("KeyS"))
        population[playerFocus].player.moveBackward(2);
    if (keyDown("KeyD"))
        population[playerFocus].player.turnRight(0.1);
    if (keyDown("KeyA"))
        population[playerFocus].player.turnLeft(0.1);

    // update HTML elements.
    data.forEach((data, key) => {
        data.tag.innerHTML = data.func(population[playerFocus].player);
    });
    mutRangeInput.nextElementSibling.innerHTML = mutRangeInput.value / 100;
    mutRateInput.nextElementSibling.innerHTML = mutRateInput.value / 100;
    speedInput.nextElementSibling.innerHTML = speedInput.value + "x";

    population.forEach(net => {
        let choice = net.evaluate()
        if (choice[0])
            net.player.moveForward(2);
        if (choice[1])
            net.player.moveBackward(2);
        if (choice[2])
            net.player.turnLeft(0.1);
        if (choice[3])
            net.player.turnRight(0.1);
    });
    
    game.render(gctx, gameWidth, gameHeight);
    
    population.forEach(individual => {
        individual.player.update(0.05, game);
        let color = "blue";
        if (colorInput.checked)
            color = colorFunction(individual.getCharacterValue())
        individual.player.draw(gctx, gameWidth, gameHeight, color);

        let d = individual.player.position.distance(game.food);
        if (d < individual.closestToFood)
            individual.closestToFood = d;
    }); 

    fitnessTag.innerHTML = "Fitness: " + formatNumber(population[playerFocus].calculateFitness(), 2);

    population[playerFocus].render(nctx, netWidth, netHeight, playerFocus);

    timer += 0.05;

    gctx.fillStyle = "white";
    gctx.textAlign = 'left';
    gctx.font = '15px pixel';
    gctx.fillText(formatNumber(timer, 1) + "s", 10, 30);

    if (timer >= +timeInput.value) {
        nextGeneration();
        timer = 0;
    }

    if (followInput.checked)
        chooseBest();

    // render the average fitness
    grctx.fillStyle = 'white';
    grctx.fillRect(0, 0, graphWidth, graphHeight);
    // draw in the average fitnesses over time
    let min = fitnessData[0], max = fitnessData[0];
    fitnessData.concat(bestFitnessData).forEach(value => {
        if (value < min) min = value;
        else if (value > max) max = value;
    });
    drawGraph(fitnessData, min, max, color="blue");
    drawGraph(bestFitnessData, min, max, color="red");
}

setInterval(function() {
    for (var i = 0; i < +speedInput.value; i++)
        gameLoop();
    setMap(mapInput.value);
}, 50);