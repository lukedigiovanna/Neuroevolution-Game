function genLayer(numNodes, numWeights) {
    let layer = [];
    for (var i = 0; i < numNodes; i++) {
        let node = [];
        for (var j = 0; j < numWeights; j++) {
            node.push(random(-1, 1));
        }
        layer.push(node);
    }
    return layer;
}

function breedLayers(layer1, layer2, mutationRate) {
    let newLayer = [];
    for (var i = 0; i < layer1.length; i++) {
        let node = [];
        for (var j = 0; j < layer1[i].length; j++) {
            let mut = 0;
            if (Math.random() < mutationRate)
                mut = random(-(+mutRangeInput.value), +mutRangeInput.value);
            if (Math.random() < 0.5) {
                node.push(layer1[i][j] + mut);
            } else {
                node.push(layer2[i][j] + mut);
            }
        }
        newLayer.push(node);
    }
    return newLayer;
}

/**
 * Holds the weights for our data
 */
function NeuralNetwork(parent1=null, parent2=null, clone=false) {
    this.hiddenLayerNodes = [];
    this.finalLayerNodes = [];
    this.inputs = [];
    
    if (!clone) {
        if (parent1 == null) { // BRAND NEW CHILD!
            // each node has a set of weights for the input fields
            // let's intialize all of the weights to a random number.
            this.hiddenLayerNodes = genLayer(10, data.size + 1);
            this.finalLayerNodes = genLayer(4, 11);
        } else if (parent2 != null) { // SEXUAL REPRODUCTION/NO MUTATIONS
            this.hiddenLayerNodes = breedLayers(parent1.hiddenLayerNodes, parent2.hiddenLayerNodes, +mutRateInput.value / 100);
            this.finalLayerNodes = breedLayers(parent1.finalLayerNodes, parent2.finalLayerNodes, +mutRateInput.value / 100);
        } else { // ASEXUAL REPRODUCTION/SOME MUTATIONS

        }
    }

    this.player = new Player(10, 90, 0);

    this.closestToFood = 9999;
}

NeuralNetwork.prototype.calculateFitness = function() {
    return this.closestToFood + this.player.timer - (this.player.hasWon ? 10 : 0);
}

NeuralNetwork.prototype.render = function(ctx, width, height) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'black';
    let outputs = [];
    for (var i = 0; i < this.hiddenLayerNodes.length; i++) {
        let netval = 0;
        for (var j = 0; j < this.inputs.length; j++) {
            let value = this.inputs[j] * this.hiddenLayerNodes[i][j];
            netval += value;
            ctx.beginPath();
            ctx.strokeStyle = (value < 0) ? "red" : "blue";
            ctx.lineWidth = Math.abs(value / 10);
            ctx.moveTo(width / 4, height / (data.size + 1) * (j + 1));
            ctx.lineTo(width / 2, height / (11) * (i + 1));
            ctx.stroke();
        }
        outputs.push(netval);
    }
    for (var i = 0; i < this.finalLayerNodes.length; i++) {
        for (var j = 0; j < outputs.length; j++) {
            let value = outputs[j] * this.finalLayerNodes[i][j];
            ctx.beginPath();
            ctx.strokeStyle = (value < 0) ? "red" : "blue";
            ctx.lineWidth = Math.abs(value / 10);
            ctx.moveTo(width / 2, height / (outputs.length + 1) * (j + 1));
            ctx.lineTo(width * 3 / 4, height / (5) * (i + 1));
            ctx.stroke();
        }
    }
    for (var i = 0; i < data.size; i++) {
        ctx.beginPath();
        ctx.arc(width / 4, height / (data.size + 1) * (i + 1), 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    for (var i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(width / 2, height / (11) * (i + 1), 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    out = this.evaluate();
    for (var i = 0; i < 4; i++) {
        if (out[i])
            ctx.fillStyle = "green";
        else
            ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(width / 4 * 3, height / (5) * (i + 1), 10, 0, 2 * Math.PI);
        ctx.fill();
    }
}

NeuralNetwork.prototype.evaluate = function() {
    // determine what the inputs are
    this.inputs = [];
    data.forEach((value, key) => {
        this.inputs.push(value.func(this.player));
    });
    // evaluate the values
    let output = [];
    for (var i = 0; i < 10; i++) {
        let value = 0;
        for (var j = 0; j < data.size; j++) {
            value += this.inputs[j] * this.hiddenLayerNodes[i][j];
        }
        value += this.hiddenLayerNodes[i][data.size];
        output.push(value);
    }
    // normalize the output array.
    let max = 0;
    for (var i = 0; i < output.length; i++)
        if (max < output[i])
            max = output[i]
    for (var i = 0; i < output.length; i++)
        output[i] /= max;

    let input = [...output];
    output = [];
    for (var i = 0; i < 4; i++) {
        let value = 0;
        for (var j = 0; j < 10; j++) {
            value += input[j] * this.finalLayerNodes[i][j];
        }
        value += this.finalLayerNodes[i][10];
        output.push(value);
    }

    for (var i = 0; i < 4; i++) {
        output[i] = output[i] > 0; 
    }
    return output;
}

NeuralNetwork.prototype.clone = function() {
    let newNet = new NeuralNetwork(clone=true);
    newNet.hiddenLayerNodes = this.hiddenLayerNodes;
    newNet.finalLayerNodes = this.finalLayerNodes;
    return newNet;
}