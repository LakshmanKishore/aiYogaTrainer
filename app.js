const homePage = document.querySelector(".homePage");
const cards = document.querySelectorAll(".card");

function startPractice(e) {
  console.log("Practice Session Started");
}


function startTraining(e) {
  console.log("id", e)
  startPractice();
}


for (let index = 0; index < cards.length; index++) {
  const element = cards[index];
  element.addEventListener("click", startTraining);
}




// Load the new image
const newImg = document.querySelector("#chair > img");

function find_angle(A, B, C) {
  let AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180) / Math.PI;
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

pose.onResults((results) => {
  console.log("Results", results);
  // Get the landmarks for the new image
  const lm = results.poseLandmarks;

  // Calculate angles at keypoints
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

  const angleLeftElbow = find_angle(l_shldr, l_elbow, l_wrist).toFixed(2);
  const angleRightElbow = find_angle(r_shldr, r_elbow, r_wrist).toFixed(2);

  const angleLeftShoulder = find_angle(l_elbow, l_shldr, l_hip).toFixed(2);
  const angleRightShoulder = find_angle(r_elbow, r_shldr, r_hip).toFixed(2);

  const angleLeftHip = find_angle(l_shldr, l_hip, l_knee).toFixed(2);
  const angleRightHip = find_angle(r_shldr, r_hip, r_knee).toFixed(2);

  const angleLeftKnee = find_angle(l_hip, l_knee, l_ankle).toFixed(2);
  const angleRightKnee = find_angle(r_hip, r_knee, r_ankle).toFixed(2);

  const angles = {}
  angles["leftElbow"] = angleLeftElbow
  angles["rightElbow"] = angleRightElbow
  angles["leftShoulder"] = angleLeftShoulder
  angles["rightShoulder"] = angleRightShoulder
  angles["leftHip"] = angleLeftHip
  angles["rightHip"] = angleRightHip
  angles["leftKnee"] = angleLeftKnee
  angles["rightKnee"] = angleRightKnee

  console.log(angles);

});


// Un comment this to get the angles of the newImg element.
// pose.send({ image: newImg }). then(() => {
//   console.log("Pose Image sent");
// }).catch((error) => {
//   console.log("Error sending image to Pose", error);
// });
