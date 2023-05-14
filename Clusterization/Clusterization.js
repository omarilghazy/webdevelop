let canvas = document.getElementsByTagName('canvas')[0],
    ctx = canvas.getContext('2d'),

    colors = [
        '#e53935',
        '#43a047',
        '#0288d1',
        '#0d47a1',
        '#7b1fa2',
        '#ff6f00',
        '#fdd835',
        '#A50B5E',
        '#757575',
        '#4e342e'
    ],

    distanceFunctions = {
        "Euclidean": euclideanDistance,
        "Manhattan": manhattanDistance
    },

    distance, // function (will be dynamically set)

    buttonAddDataPointsManually = document.getElementById('add-data-points-manually'),
    buttonAddDataPointsRandomly = document.getElementById('add-data-points-randomly'),
    buttonRemoveAllDataPoints = document.getElementById('remove-all-data-points'),

    buttonAddCentroidsManually = document.getElementById('add-centroids-manually'),
    buttonAddCentroidsRandomly = document.getElementById('add-centroids-randomly'),
    buttonRemoveAllCentroids = document.getElementById('remove-all-centroids'),

    buttonReassignDataPoints = document.getElementById('reassign-data-points'),
    buttonUpdateCentroidsPositions = document.getElementById('update-centroids-positions'),
    buttonRunStepsInLoop = document.getElementById('run-steps-in-loop'),

    inputAddDataPointsRandomlyCount = document.getElementById('add-data-points-randomly-count'),
    inputAddCentroidsRandomlyCount = document.getElementById('add-centroids-randomly-count'),
    inputRunStepsInLoopMilliseconds = document.getElementById('run-steps-in-loop-milliseconds'),

    selectDistanceFunction = document.getElementById('distance-function');


canvas.addEventListener('click', (e) => addNewPoint(getPointClickedOnCanvas(e)), false);

buttonAddDataPointsManually.addEventListener('click', toggleAddingDataPointsManually, false);
buttonAddDataPointsRandomly.addEventListener('click', () => addDataPointsRandomly(+inputAddDataPointsRandomlyCount.value), false);
buttonRemoveAllDataPoints.addEventListener('click', removeAllDataPoints, false);

buttonAddCentroidsManually.addEventListener('click', toggleAddingCentroidsManually, false);
buttonAddCentroidsRandomly.addEventListener('click', () => addCentroidsRandomly(+inputAddCentroidsRandomlyCount.value), false);
buttonRemoveAllCentroids.addEventListener('click', removeAllCentroids, false);

buttonReassignDataPoints.addEventListener('click', reassignDataPoints, false);
buttonUpdateCentroidsPositions.addEventListener('click', updateCentroidsPositions, false);
buttonRunStepsInLoop.addEventListener('click', runStepsInLoop, false);

inputAddDataPointsRandomlyCount.addEventListener('keyup', (e) => ifEnterThenCall(e, () => buttonAddDataPointsRandomly.click()));
inputAddCentroidsRandomlyCount.addEventListener('keyup', (e) => ifEnterThenCall(e, () => buttonAddCentroidsRandomly.click()));
inputRunStepsInLoopMilliseconds.addEventListener('keyup', (e) => ifEnterThenCall(e, restartLoop));

fillDistanceFunctionSelect();
changeDistanceFunction();
selectDistanceFunction.addEventListener('change', changeDistanceFunction, false);

let dataPoints = [],
    centroids = [],
    dataPointsAssignedCentroids = {}, // { dataPointIndex: centroidIndex }
    addingDataPointsManually = false,
    addingCentroidsManually = false,
    steps = [
        reassignDataPoints,
        updateCentroidsPositions
    ],
    currentStep,
    nextAfter,
    timeout,
    loopRunning = false;

let color1 = [];
let color2 = [];
let color3 = [];
let color4 = [];
let color5 = [];
let color6 = [];
let color7 = [];
let color8 = [];
let color9 = [];
let color10 = [];

function addNewPoint(point) {
    if (addingDataPointsManually) {
        dataPoints.push(point);
        redrawAll();
    } else if (addingCentroidsManually) {
        if (tryAddNewCentroid(point)) {
            redrawAll();
        } else {
            showCentroidLimitReachedMessage();
            toggleAddingCentroidsManually();
        }
    }
}

function getPointClickedOnCanvas(e) {
    let canvasRect = canvas.getBoundingClientRect();

    return [
        e.clientX - canvasRect.left - 1,
        e.clientY - canvasRect.top - 1
    ];
}

function toggleAddingDataPointsManually() {
    if (addingCentroidsManually) {
        toggleAddingCentroidsManually();
    }

    addingDataPointsManually = !addingDataPointsManually;
    toggleButtonText(buttonAddDataPointsManually);
    updateCanvasStyles();
}

function addDataPointsRandomly(count) {
    for (let i = 0; i < count; ++i) {
        let newPoint;

        do {
            newPoint = [
                randInt(0, canvas.width - 1),
                randInt(0, canvas.height - 1)
            ];
        } while (newPoint in centroids);

        dataPoints.push(newPoint);
    }

    redrawAll();
}

function removeAllDataPoints() {
    dataPoints = [];
    dataPointsAssignedCentroids = {};
    redrawAll();
}

function toggleAddingCentroidsManually() {
    if (!addingCentroidsManually && isCentroidLimitReached()) {
        showCentroidLimitReachedMessage();
        return;
    }

    if (addingDataPointsManually) {
        toggleAddingDataPointsManually();
    }

    addingCentroidsManually = !addingCentroidsManually;
    toggleButtonText(buttonAddCentroidsManually);
    updateCanvasStyles();
}

function addCentroidsRandomly(count) {
    let limitReached = false;

    for (let i = 0; i < count; ++i) {
        let newPoint;

        do {
            newPoint = [
                randInt(0, canvas.width - 1),
                randInt(0, canvas.height - 1)
            ];
        } while (newPoint in centroids);

        if (!tryAddNewCentroid(newPoint)) {
            limitReached = true;
            break;
        }
    }

    redrawAll();

    if (limitReached) {
        showCentroidLimitReachedMessage();
    }
}

function removeAllCentroids() {
    centroids = [];
    dataPointsAssignedCentroids = {};
    redrawAll();
}

function reassignDataPoints() {
    dataPoints.map((point, pointIndex) => {
        let smallestDistance = Number.MAX_SAFE_INTEGER,
            closestCentroidIndex = undefined;
        centroids.map((centroid, centroidIndex) => {
            let dist = distance(point, centroid);

            if (dist < smallestDistance) {
                smallestDistance = dist;
                closestCentroidIndex = centroidIndex;
            }
        });

        dataPointsAssignedCentroids[pointIndex] = closestCentroidIndex;
    });

    redrawAll();
}

function updateCentroidsPositions() {
    centroids.map((centroid, centroidIndex) => {
        let assignedPoints = dataPoints.filter((_, pointIndex) => dataPointsAssignedCentroids[pointIndex] == centroidIndex),
            sumX = 0,
            sumY = 0;

        if (assignedPoints.length == 0) {
            return;
        }

        assignedPoints.map(([x, y]) => {
            sumX += x;
            sumY += y;
        });

        centroid[0] = sumX / assignedPoints.length;
        centroid[1] = sumY / assignedPoints.length;
    });

    redrawAll();
}

function runStepsInLoop() {
    toggleButtonText(buttonRunStepsInLoop);

    if (!loopRunning) {
        loopRunning = true;
        currentStep = 0;
        nextAfter = +inputRunStepsInLoopMilliseconds.value;

        if (isNaN(nextAfter) || nextAfter <= 0) {
            alert('Wrong value!');
            return;
        }

        enqueNextStep(0);
    } else {
        clearTimeout(timeout);
        loopRunning = false;
    }
}

function ifEnterThenCall(e, func) {
    e.keyCode == 13 && func();
}

function restartLoop() {
    if (loopRunning) {
        runStepsInLoop();
    }

    runStepsInLoop();
}

function euclideanDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
}

function manhattanDistance(point1, point2) {
    return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
}

function fillDistanceFunctionSelect() {
    for (let name in distanceFunctions) {
        let option = document.createElement('option');
        option.value = option.innerHTML = name;
        selectDistanceFunction.appendChild(option);
    }
}

function changeDistanceFunction() {
    distance = distanceFunctions[selectDistanceFunction.value];
}

function redrawAll() {
    canvas.width = canvas.width;
    dataPoints.map(drawDataPoint);
    centroids.map(drawCentroid);

    hull(color1, '#e53935');
    hull(color2, '#43a047');
    hull(color3, '#0288d1');
    hull(color4, '#0d47a1');
    hull(color5, '#7b1fa2');
    hull(color6, '#ff6f00');
    hull(color7, '#fdd835');
    hull(color8, '#A50B5E');
    hull(color9, '#757575');
    hull(color10, '#4e342e');

    color1 = [];
    color2 = [];
    color3 = [];
    color4 = [];
    color5 = [];
    color6 = [];
    color7 = [];
    color8 = [];
    color9 = [];
    color10 = [];
}

function hull(points, color) {
    if (points.length > 0) {
        let convexHull = new ConvexHull(points);
        convexHull.calculate();

        for (let i = 1; i < convexHull.hull.length; i++) {
            let p1 = convexHull.hull[i - 1];
            let p2 = convexHull.hull[i];
            ctx.lineWidth = 3;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

function tryAddNewCentroid(point) {
    if (isCentroidLimitReached()) {
        return false;
    }

    centroids.push(point);
    return true;
}

function showCentroidLimitReachedMessage() {
    // using timeout to show alert after canvas is refreshed
    setTimeout(() => alert(`Sorry, reached limit of ${colors.length} colors.`), 50);
}

function toggleButtonText(button) {
    let currentText = button.innerHTML;
    button.innerHTML = button.getAttribute('data-toggle');
    button.setAttribute('data-toggle', currentText);
}

function updateCanvasStyles() {
    if (addingDataPointsManually || addingCentroidsManually) {
        canvas.classList.add('canvas-picking-active');
    } else {
        canvas.classList.remove('canvas-picking-active');
    }
}

function randInt(min, max) {
    if (arguments.length == 1) {
        max = arguments[0];
        min = 0;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isCentroidLimitReached() {
    return centroids.length >= colors.length;
}

function enqueNextStep(overrideAfter) {
    let delay = overrideAfter != undefined ? overrideAfter : nextAfter;

    timeout = setTimeout(() => {
        steps[currentStep]();
        currentStep = (currentStep + 1) % steps.length;
        enqueNextStep();
    }, delay);
}

function drawDataPoint([x, y], index) {
    if (dataPointsAssignedCentroids[index] === 0) {
        color1.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 1) {
        color2.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 2) {
        color3.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 3) {
        color4.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 4) {
        color5.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 5) {
        color6.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 6) {
        color7.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 7) {
        color8.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 8) {
        color9.push(new Point(x, y));
    }

    if (dataPointsAssignedCentroids[index] === 9) {
        color10.push(new Point(x, y));
    }

    ctx.save();
    ctx.fillStyle = colors[dataPointsAssignedCentroids[index]];
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

function drawCentroid([x, y], index) {
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = colors[index];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.save();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
}

function Point(x, y) {
    this.x = x;
    this.y = y;

    this.toString = function () {
        return "x: " + x + ", y: " + y;
    };

    this.rotateRight = function (p1, p2) {
        // cross product, + is counterclockwise, - is clockwise
        return ((p2.x * y - p2.y * x) - (p1.x * y - p1.y * x) + (p1.x * p2.y - p1.y * p2.x)) < 0;
    };
}

function ConvexHull(points) {
    this.calculate = function () {
        this.hull = [];

        points.sort(function compare(p1, p2) {
            return p1.x - p2.x;
        });

        upperHull = [];
        this.calcUpperhull(upperHull);

        for (let i = 0; i < upperHull.length; i++) {
            this.hull.push(upperHull[i]);
        }

        lowerHull = [];
        this.calcLowerhull(lowerHull);

        for (let i = 0; i < lowerHull.length; i++) {
            this.hull.push(lowerHull[i]);
        }
    };

    this.calcUpperhull = function (upperHull) {
        let i = 0;
        upperHull.push(points[i]);
        i++;
        upperHull.push(points[i]);
        i++;

        // Start upperHull scan
        for (i; i < points.length; i++) {
            upperHull.push(points[i]);

            while (
                upperHull.length > 2 && // more than 2 points
                !upperHull[upperHull.length - 3].rotateRight(upperHull[upperHull.length - 1], upperHull[upperHull.length - 2]) // last 3 points make left turn
                )
                upperHull.splice(upperHull.indexOf(upperHull[upperHull.length - 2]), 1); // remove middle point
        }
    };

    this.calcLowerhull = function (lowerHull) {
        let i = points.length - 1;
        lowerHull.push(points[i]);
        i--;
        lowerHull.push(points[i]);
        i--;

        for (i; i >= 0; i--) {
            lowerHull.push(points[i]);

            while (
                lowerHull.length > 2 &&  
                !lowerHull[lowerHull.length - 3].rotateRight(lowerHull[lowerHull.length - 1], lowerHull[lowerHull.length - 2])  
                )
                lowerHull.splice(lowerHull.indexOf(lowerHull[lowerHull.length - 2]), 1); // remove middle point
        }
    };
}
