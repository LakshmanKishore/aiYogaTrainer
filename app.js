const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const angleLeftElbow = document.querySelector(".angleLeftElbow");
const angleRightElbow = document.querySelector(".angleRightElbow");
const grid = new LandmarkGrid(landmarkContainer);
var i = 10;
const w = canvasElement.width, h = canvasElement.height;

function find_angle(A,B,C) {
  let AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
  let BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
  let AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
  return (Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB))*180)/Math.PI;
}

function onResults(results) {
  if (!results.poseLandmarks) {
    grid.updateLandmarks([]);
    return;
  }

  // console.log("updating", results)
  const lm = results.poseLandmarks;
  const l_shldr = {x:lm[11].x,y:lm[11].y},
        l_elbow = {x:lm[13].x,y:lm[13].y},
        l_wrist = {x:lm[15].x,y:lm[15].y};

  const r_shldr = {x:lm[12].x,y:lm[12].y},
        r_elbow = {x:lm[14].x,y:lm[14].y},
        r_wrist = {x:lm[16].x,y:lm[16].y};

  angleLeftElbow.innerHTML = find_angle(l_shldr,l_elbow,l_wrist).toFixed(2);
  angleRightElbow.innerHTML = find_angle(r_shldr,r_elbow,r_wrist).toFixed(2);
  // if(i>=0){
  //   i-=1;
  // }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00000001';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';
  // console.log(results.poseLandmarks);
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
    { color: '#00FF00', lineWidth: 1 });

  drawLandmarks(canvasCtx, results.poseLandmarks, { fillColor: '#00000002', lineWidth: 2, radius: 15, color: "#FF5F29" });
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

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 500,
  height: 400
});
camera.start();