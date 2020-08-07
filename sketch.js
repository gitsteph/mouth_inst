// initialize global variables
let classifier;
let video;
let detections;
let middleX;
let sound1;
let sound2;
let mouthOpenThreshold = 10;
let lastMouthOpenBool = false;
let showCapture = true;

// define classifier options
const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false
};


// define classifier callback
function modelLoaded() {
    console.log("Model loaded!");
    classifier.detect(gotResult);
    // showCapture = false;
}

function preload() {
    // selecting short sounds for now!
    sound1 = loadSound("assets/431326__someguy22__8-bit-text-blip-medium-pitch.wav");
    sound2 = loadSound("assets/431327__someguy22__8-bit-text-blip-low-pitch.wav");
}

function setup() {
    // set up a p5 canvas
    createCanvas(600, 400);
    middleX = width / 2;

    // load video using p5
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    // load classifier with video, options, and callback
    classifier = ml5.faceApi(
        video, detectionOptions, modelLoaded
    );
}

function gotResult(error, results) {
    // display error in the console
    if (error) {
        console.error(error);
    } else {
        // do something with your results
        // print to the console
        console.log("new results: ");
        console.log(results);
        // bind to a global `detections` variable
        detections = results;
    }

    // call the detect method again here so it keeps going
    // could also potentially call detect in draw, with some handling
    classifier.detect(gotResult);
}

function drawNumberedLandmarks() {
    if (detections) {
        textSize(12);
        fill(200);
        for (let formIdx = 0; formIdx < detections.length; formIdx++) {
            let landmarks = detections[formIdx].landmarks._positions;
            for (let landmarkIdx = 0; landmarkIdx < landmarks.length; landmarkIdx++) {
                text(landmarkIdx, width-landmarks[landmarkIdx]._x, landmarks[landmarkIdx]._y);
            }
        }
    }
}

function isMouthOpen(mouthTopPos, mouthBtmPos) {
    return dist(mouthTopPos._x, mouthTopPos._y, mouthBtmPos._x, mouthBtmPos._y) > mouthOpenThreshold;
}

function triggerSoundBasedOnPos(targetPos) {
    if (targetPos._x > middleX) {
        sound1.play();
        console.log("sound1 triggered");
    } else {
        sound2.play();
        console.log("sound2 triggered");
    }
}

function drawMouths(){
    if (detections) {
        stroke("magenta");
        strokeWeight(2);
        noFill();
        for (let formIdx = 0; formIdx < detections.length; formIdx++) {
            let mouthArr = detections[formIdx].parts.mouth;
            beginShape();
            for (let mouthIdx = 0; mouthIdx < mouthArr.length; mouthIdx++) {
                vertex(mouthArr[mouthIdx]._x, mouthArr[mouthIdx]._y);
            }
            vertex(mouthArr[0]._x, mouthArr[0]._y);
            endShape();
        }
    }
}
    

function drawCapture() {
    tint(255, 128);
    image(video, 0, 0, width, height);
}

function drawTwoSides() {
    strokeWeight(4);
    noFill();

    stroke(0, 255, 255, 255);
    // fill(0, 255, 255, 100);
    rect(0, 0, width / 2 - 2, height);
    stroke(204, 255, 0, 255);
    // fill(204, 255, 0, 100);
    rect(width / 2 + 2, 0, width / 2 - 2, height);
}

function draw() {
    background(255);

    // render/execute draw every frame using last logged detections
    if (detections) {
        // for debugging/identifying landmarks only
        // drawNumberedLandmarks();

        // if mouth open, trigger sound based on pos
        for (let formIdx = 0; formIdx < detections.length; formIdx++) {
            let mouthTop = detections[formIdx].landmarks._positions[62];
            let mouthBtm = detections[formIdx].landmarks._positions[66];
            console.log(isMouthOpen(mouthTop, mouthBtm));
            if (!lastMouthOpenBool && isMouthOpen(mouthTop, mouthBtm)) {
                triggerSoundBasedOnPos(mouthTop);
            }
            lastMouthOpenBool = isMouthOpen(mouthTop, mouthBtm);
        }
    }

    push();
    translate(width, 0);
    scale(-1, 1);
    if (showCapture) {
        drawCapture();
    }
    drawTwoSides();
    drawMouths();
    pop();
}
