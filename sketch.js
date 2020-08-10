// ml5 global variables
let classifier;
let detections;

// sounds to load and trigger
let sound1;
let sound2;

// video variables
let video;
let showCapture = true;

// trigger boundary and threshold variables
let middleX;
let mouthOpenThreshold = 10;
let lastMouthOpenBool = false;

// classifier options
const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false
};


// ML5 CALLBACK FUNCTIONS

function modelLoaded() {
    console.log("Model loaded!");

    // run face detection, with gotResult method passed as callback
    classifier.detect(gotResult);

    /* enable the next line to hide webcam view
       after model has loaded */
    // showCapture = false;
}

function gotResult(error, results) {
    // display error in the console
    if (error) {
        console.error(error);
    } else {
        // do something with your results
        // console.log("new results: "); // uncomment for debugging
        // console.log(results); // uncomment for debugging
        // bind to a global `detections` variable
        detections = results;
    }

    // call the detect method again here so it keeps going
    // could also potentially call detect in draw, with some handling
    classifier.detect(gotResult);
}


// FUNCTIONS TO DETERMINE TRIGGER + SOUND

function isMouthOpen(mouthTopPos, mouthBtmPos) {
    return dist(mouthTopPos._x, mouthTopPos._y, mouthBtmPos._x, mouthBtmPos._y) > mouthOpenThreshold;
}

function triggerSoundBasedOnPos(targetPos) {
    if (targetPos._x > middleX) {
        sound1.play();
        console.log("playing sound1!");
    } else {
        sound2.play();
        console.log("playing sound2!");
    }
}


// FUNCTIONS TO CALL IN DRAW

function drawTwoSides() {
    strokeWeight(4);
    noFill();

    // left side
    stroke(0, 255, 255, 255);
    // fill(0, 255, 255, 100);
    rect(0, 0, width / 2 - 2, height);

    // right side
    stroke(204, 255, 0, 255);
    // fill(204, 255, 0, 100);
    rect(width / 2 + 2, 0, width / 2 - 2, height);
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

// This function is useful for debugging!
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


// SEVERAL P5 PROGRAM FLOW FUNCTIONS

// called exactly once
function preload() {
    /* load two sounds
       selecting short sounds for now! */
    sound1 = loadSound("assets/431326__someguy22__8-bit-text-blip-medium-pitch.wav");
    sound2 = loadSound("assets/431327__someguy22__8-bit-text-blip-low-pitch.wav");
}

// called exactly once
function setup() {
    // set up a p5 canvas
    createCanvas(600, 400);

    // define boundary line
    middleX = width / 2;

    // load video using p5
    video = createCapture(VIDEO);
    // set video size to width and height of canvas
    // hide video feed to render later in draw
    video.size(width, height);
    video.hide();

    // load classifier with video, options, and callback
    classifier = ml5.faceApi(
        video, detectionOptions, modelLoaded
    );
}

// called every frame
function draw() {
    // clear background
    background(255);

    // uses last logged detections
    if (detections) {
        // drawNumberedLandmarks(); // uncomment for debugging

        // if mouth open, trigger sound based on pos
        for (let formIdx = 0; formIdx < detections.length; formIdx++) {
            let mouthTop = detections[formIdx].landmarks._positions[62];
            let mouthBtm = detections[formIdx].landmarks._positions[66];
            // console.log(isMouthOpen(mouthTop, mouthBtm)); // uncomment for debugging
            if (!lastMouthOpenBool && isMouthOpen(mouthTop, mouthBtm)) {
                triggerSoundBasedOnPos(mouthTop);
            }
            lastMouthOpenBool = isMouthOpen(mouthTop, mouthBtm);
        }
    }

    // translate and scale canvas to draw the following like a mirror
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
