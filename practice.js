const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const angleLeftElbow = document.querySelector(".angleLeftElbow");
const angleRightElbow = document.querySelector(".angleRightElbow");
const angleLeftShoulder = document.querySelector(".angleLeftShoulder");
const angleRightShoulder = document.querySelector(".angleRightShoulder");
const angleLeftHip = document.querySelector(".angleLeftHip");
const angleRightHip = document.querySelector(".angleRightHip");
const angleLeftKnee = document.querySelector(".angleLeftKnee");
const angleRightKnee = document.querySelector(".angleRightKnee");
const grid = new LandmarkGrid(landmarkContainer);
const loader = document.querySelector(".loader");

const poseImage = document.querySelector(".pose-image");
// image popup
const viewPose = document.querySelector(".view-pose");

// Get the modal
const modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];


const urlParams = new URLSearchParams(window.location.search);
const selectedPose = urlParams.get('pose');
console.log("Pose:", selectedPose);





let CameraCaptureStarted = false;

const w = canvasElement.width, h = canvasElement.height;
let leftShoulderColor, rightShoulderColor;
let leftElbowColor, rightElbowColor;
let leftHipColor, rightHipColor;
let leftKneeColor, rightKneeColor;
let colorsArray = [],
  start = false,
  startTimeStamp,
  currentTimeStamp = 0,
  secondsHold,
  countdown = 5,
  textXPosition,
  textYPosition;

// canvasElement.width = window.innerWidth;
// canvasElement.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
});



const correctAngles = {
  "chair": {
    "leftElbow": "174.11",
    "rightElbow": "170.91",
    "leftShoulder": "88.10",
    "rightShoulder": "104.53",
    "leftHip": "127.96",
    "rightHip": "113.29",
    "leftKnee": "96.28",
    "rightKnee": "108.25"
  },
  "goddess": {
    "leftElbow": "91.45",
    "rightElbow": "93.94",
    "leftShoulder": "91.37",
    "rightShoulder": "99.83",
    "leftHip": "102.89",
    "rightHip": "96.17",
    "leftKnee": "110.91",
    "rightKnee": "104.50"
  },
  // "goddess": {
  //   "leftElbow": "88.27",
  //   "rightElbow": "89.23",
  //   "leftShoulder": "92.14",
  //   "rightShoulder": "93.70",
  //   "leftHip": "112.72",
  //   "rightHip": "111.51",
  //   "leftKnee": "119.44",
  //   "rightKnee": "118.21"
  // },
  "star": {
    "leftElbow": "169.49",
    "rightElbow": "174.28",
    "leftShoulder": "91.88",
    "rightShoulder": "92.75",
    "leftHip": "160.68",
    "rightHip": "160.10",
    "leftKnee": "178.16",
    "rightKnee": "178.45"
  },
  "half-moon": {
    "leftElbow": "163.81",
    "rightElbow": "164.74",
    "leftShoulder": "70.97",
    "rightShoulder": "112.79",
    "leftHip": "171.79",
    "rightHip": "72.71",
    "leftKnee": "178.31",
    "rightKnee": "165.61"
  }
}

const angleBuffer = 20;




function find_angle(A, B, C) {
  let AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180) / Math.PI;
}

function angleComparison(correctAngle, performedAngle) {
  return performedAngle > (correctAngle - angleBuffer) && performedAngle < (correctAngle + angleBuffer) ? "green" : "red";
}

function drawNumberBox(ctx, number, x, y, width, height, fontName) {
  // Draw the white background rectangle
  ctx.fillStyle = 'blue';
  ctx.fillRect(x, y, width, height);

  // Set the font and text alignment
  ctx.font = `100px ${fontName}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';

  // Draw the number centered inside the box
  textXPosition = x + (width / 2);
  textYPosition = y + (height / 2);

  ctx.fillText(number, textXPosition, textYPosition);
}

function onResults(results) {
  if (!CameraCaptureStarted) {
    loader.style.display = "none";
    CameraCaptureStarted = true;

    // Set the canvasElement width and height
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  }
  if (!results.poseLandmarks) {
    grid.updateLandmarks([]);
    return;
  }

  // console.log("updating", results)
  const lm = results.poseLandmarks;
  const l_shldr = { x: lm[11].x, y: lm[11].y },
    l_elbow = { x: lm[13].x, y: lm[13].y },
    l_wrist = { x: lm[15].x, y: lm[15].y },
    l_hip = { x: lm[23].x, y: lm[23].y },
    l_knee = { x: lm[25].x, y: lm[25].y },
    l_ankle = { x: lm[27].x, y: lm[27].y };

  const r_shldr = { x: lm[12].x, y: lm[12].y },
    r_elbow = { x: lm[14].x, y: lm[14].y },
    r_wrist = { x: lm[16].x, y: lm[16].y },
    r_hip = { x: lm[24].x, y: lm[24].y },
    r_knee = { x: lm[26].x, y: lm[26].y },
    r_ankle = { x: lm[28].x, y: lm[28].y };

  angleLeftElbow.innerHTML = find_angle(l_shldr, l_elbow, l_wrist).toFixed(2);
  angleRightElbow.innerHTML = find_angle(r_shldr, r_elbow, r_wrist).toFixed(2);

  angleLeftShoulder.innerHTML = find_angle(l_elbow, l_shldr, l_hip).toFixed(2);
  angleRightShoulder.innerHTML = find_angle(r_elbow, r_shldr, r_hip).toFixed(2);

  angleLeftHip.innerHTML = find_angle(l_shldr, l_hip, l_knee).toFixed(2);
  angleRightHip.innerHTML = find_angle(r_shldr, r_hip, r_knee).toFixed(2);

  angleLeftKnee.innerHTML = find_angle(l_hip, l_knee, l_ankle).toFixed(2);
  angleRightKnee.innerHTML = find_angle(r_hip, r_knee, r_ankle).toFixed(2);




  leftShoulderColor = angleComparison(correctAngles[selectedPose]["leftShoulder"], angleLeftShoulder.innerHTML);
  rightShoulderColor = angleComparison(correctAngles[selectedPose]["rightShoulder"], angleRightShoulder.innerHTML);

  leftElbowColor = angleComparison(correctAngles[selectedPose]["leftElbow"], angleLeftElbow.innerHTML);
  rightElbowColor = angleComparison(correctAngles[selectedPose]["rightElbow"], angleRightElbow.innerHTML);

  leftHipColor = angleComparison(correctAngles[selectedPose]["leftHip"], angleLeftHip.innerHTML);
  rightHipColor = angleComparison(correctAngles[selectedPose]["rightHip"], angleRightHip.innerHTML);

  leftKneeColor = angleComparison(correctAngles[selectedPose]["leftKnee"], angleLeftKnee.innerHTML);
  rightKneeColor = angleComparison(correctAngles[selectedPose]["rightKnee"], angleRightKnee.innerHTML);

  // colorsArray.push(leftShoulderColor,rightShoulderColor,leftElbowColor,rightElbowColor,leftHipColor,rightHipColor,leftKneeColor,rightKneeColor);
  // colorsSet=new Set(colorsArray);
  // console.log(colorsSet)
  // console.log(leftElbowColor);

  
  canvasCtx.save();
  
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  // canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00000001';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  // console.log(results.image, typeof(results.image));
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';
  // console.log(results.poseLandmarks);
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: 'red', lineWidth: 3 });

  const faceLandmarks = [lm[0], lm[2], lm[5], lm[7], lm[8], lm[9], lm[10]];
  const bodyLandmarks = [lm[11], lm[12], lm[13], lm[14], lm[23], lm[24]];
  const wristFootLandmarks = [lm[15], lm[16], lm[17], lm[18], lm[19], lm[20], lm[21], lm[22]];

  // const bodyLandmarkColors=[]

  drawLandmarks(canvasCtx, faceLandmarks, { fillColor: '#00000002', lineWidth: 2, radius: 5, color: "blue" });
  drawLandmarks(canvasCtx, bodyLandmarks, { fillColor: '#00000002', lineWidth: 2, radius: 5, color: "blue" });
  drawLandmarks(canvasCtx, wristFootLandmarks, { fillColor: '#00000002', lineWidth: 2, radius: 3, color: "blue" });
  drawLandmarks(canvasCtx, [lm[11]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: leftShoulderColor });
  drawLandmarks(canvasCtx, [lm[12]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: rightShoulderColor });
  drawLandmarks(canvasCtx, [lm[13]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: leftElbowColor });
  drawLandmarks(canvasCtx, [lm[14]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: rightElbowColor });
  drawLandmarks(canvasCtx, [lm[23]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: leftHipColor });
  drawLandmarks(canvasCtx, [lm[24]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: rightHipColor });
  drawLandmarks(canvasCtx, [lm[25]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: leftKneeColor });
  drawLandmarks(canvasCtx, [lm[26]], { fillColor: '#00000002', lineWidth: 5, radius: 20, color: rightKneeColor });

  // drawNumberBox(canvasCtx, 0, canvasElement.width - 150, canvasElement.height - 150, 150, 150, "sans-serif");
  canvasCtx.scale(-1,1)
  // Since the canvas is transformed to scale(-1,1) Hence x is -150
  drawNumberBox(canvasCtx, 0, -150, canvasElement.height - 150, 150, 150, "sans-serif");


  if (leftShoulderColor === "green" && rightShoulderColor === "green" && leftElbowColor === "green" && rightElbowColor === "green" && leftHipColor === "green" && rightHipColor === "green" && leftKneeColor === "green" && rightKneeColor === "green") {
    if (start == false) {
      startTimeStamp = new Date();
      start = true;
      console.log("started");
    } else {
      currentTimeStamp = new Date() - startTimeStamp;
      secondsHold = Math.round(currentTimeStamp / 1000);
      canvasCtx.globalCompositeOperation = 'source-over';
      drawNumberBox(canvasCtx, secondsHold, -150, canvasElement.height - 150, 150, 150, "sans-serif");

      if (currentTimeStamp >= 5000) {
        console.log("Move to next Asana");
        start = false;
        let msg = new SpeechSynthesisUtterance();
        msg.text = "Congratulations you finished this posture completely, Lets move on to next posture!";
        window.speechSynthesis.speak(msg);
        stopWebCamCapture();
      }
    }
  }

  else if (start === true && (leftShoulderColor === "red" || rightShoulderColor === "red" || leftElbowColor === "red" || rightElbowColor === "red" || leftHipColor === "red" || rightHipColor === "red" || leftKneeColor === "red" || rightKneeColor === "red")) {
    start = false;
    console.log("Restart");
  }

  canvasCtx.restore();
  
  grid.updateLandmarks(results.poseWorldLandmarks);
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});


pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);
poseImage.setAttribute("src", `images/${selectedPose}.png`);

const camera = new Camera(videoElement, {
  // facingMode: "environment",
  onFrame: async () => {
    await pose.send({ image: videoElement });
  }
});
camera.start();



// When the user clicks on the button, open the modal
viewPose.onclick = function () {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function stopWebCamCapture() {
  const video = document.querySelector('video');

  // A video's MediaStream object is available through its srcObject attribute
  const mediaStream = video.srcObject;

  // Through the MediaStream, you can get the MediaStreamTracks with getTracks():
  const tracks = mediaStream.getTracks();

  // Tracks are returned as an array, so if you know you only have one, you can stop it with: 
  tracks[0].stop();

  // Or stop all like so:
  tracks.forEach(track => track.stop())
}

window.addEventListener("keydown", function (event) {
  if (event.key === 'q') {
    console.log("Stopping Web Cam Capture")
    stopWebCamCapture();
  }
});