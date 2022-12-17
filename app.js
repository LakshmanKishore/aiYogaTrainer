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
        l_wrist = {x:lm[15].x,y:lm[15].y},
        l_hip = {x:lm[23].x,y:lm[23].y},
        l_knee = {x:lm[25].x,y:lm[25].y},
        l_ankle = {x:lm[27].x,y:lm[27].y};
        
        const r_shldr = {x:lm[12].x,y:lm[12].y},
        r_elbow = {x:lm[14].x,y:lm[14].y},
        r_wrist = {x:lm[16].x,y:lm[16].y},
        r_hip = {x:lm[24].x,y:lm[24].y},
        r_knee = {x:lm[26].x,y:lm[26].y},
        r_ankle = {x:lm[28].x,y:lm[28].y};
        
  angleLeftElbow.innerHTML = find_angle(l_shldr,l_elbow,l_wrist).toFixed(2);
  angleRightElbow.innerHTML = find_angle(r_shldr,r_elbow,r_wrist).toFixed(2);

  angleLeftShoulder.innerHTML = find_angle(l_elbow,l_shldr,l_hip).toFixed(2);
  angleRightShoulder.innerHTML = find_angle(r_elbow,r_shldr,r_hip).toFixed(2);

  angleLeftHip.innerHTML = find_angle(l_shldr,l_hip,l_knee).toFixed(2);
  angleRightHip.innerHTML = find_angle(r_shldr,r_hip,r_knee).toFixed(2);
  
  angleLeftKnee.innerHTML = find_angle(l_hip,l_knee,l_ankle).toFixed(2);
  angleRightKnee.innerHTML = find_angle(r_hip,r_knee,r_ankle).toFixed(2);

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
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,{ color: 'red', lineWidth: 3 });
  
  const faceLandmarks=[lm[0],lm[2],lm[5],lm[7],lm[8],lm[9],lm[10]];
  const bodyLandmarks = [lm[11],lm[12],lm[13],lm[14],lm[23],lm[24]];
  const wristFootLandmarks = [lm[15],lm[16],lm[17],lm[18],lm[19],lm[20],lm[21],lm[22]];

  drawLandmarks(canvasCtx, faceLandmarks, { fillColor: '#00000002', lineWidth: 2, radius: 5, color: "blue"  });
  drawLandmarks(canvasCtx, bodyLandmarks, { fillColor: '#00000002', lineWidth: 2, radius: 15, color: "blue"  });
  drawLandmarks(canvasCtx, wristFootLandmarks, { fillColor: '#00000002', lineWidth: 2, radius: 3, color: "blue"  });
  
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