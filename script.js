const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const voiceButton = document.getElementById('voice-button');
const imageUpload = document.getElementById('image-upload');
const webcamElement = document.getElementById('webcam');
const outputCanvas = document.getElementById('output');
const handSignButton = document.getElementById('hand-sign-button');

let handposeModel;

// Function to append a message to the chat box
function appendMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message', sender === 'user' ? 'user-message' : 'bot-message');
  messageElement.innerHTML = `<p>${message}</p>`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to process user input
function processUserInput(input) {
  const userMessage = input.trim();
  if (userMessage !== '') {
    appendMessage(userMessage, 'user');
    // You can replace this part with your logic to respond to the user's message
    // For now, let's just respond with a dummy message
    setTimeout(() => {
      const response = 'I am just a demo bot. I am still learning!';
      appendMessage(response, 'bot');
    }, 500);
  }
}

// Event listener for user text input
userInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    processUserInput(userInput.value);
    userInput.value = '';
  }
});

// Event listener for voice button
voiceButton.addEventListener('click', function () {
  recognizeSpeech();
});

// Function to handle speech recognition
function recognizeSpeech() {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    processUserInput(speechResult);
  }
}

// Event listener for image upload
imageUpload.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        recognizeImage(image);
      }
    };
    reader.readAsDataURL(file);
  }
});

// Function to recognize image using MobileNet model
async function recognizeImage(image) {
  const model = await mobilenet.load();
  const predictions = await model.classify(image);
  let message = 'I think this is ';
  predictions.forEach((prediction, index) => {
    if (index > 0) {
      message += ', or ';
    }
    message += `${prediction.className} (${Math.round(prediction.probability * 100)}% confident)`;
  });
  appendMessage(message, 'bot');
}

// Load Handpose model
async function loadHandposeModel() {
  handposeModel = await handpose.load();
}

// Detect hand sign
async function detectHandSign() {
  const ctx = outputCanvas.getContext('2d');
  const video = await startWebcam();

  async function startWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamElement.srcObject = stream;
    return new Promise((resolve) => {
      webcamElement.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  async function detect() {
    const predictions = await handposeModel.estimateHands(video);
    if (predictions.length > 0) {
      const hand = predictions[0];
      const landmarks = hand.landmarks;
      const letter = getLetter(landmarks);
      appendMessage(`Recognized letter: ${letter}`, 'bot');
    }
    requestAnimationFrame(detect);
  }
  detect();
}

function getLetter(landmarks) {
  // Calculate distances between finger landmarks
  const distances = [];
  for (let i = 0; i < landmarks.length - 1; i++) {
    for (let j = i + 1; j < landmarks.length; j++) {
      const dx = landmarks[i][0] - landmarks[j][0];
      const dy = landmarks[i][1] - landmarks[j][1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      distances.push(distance);
    }
  }
  // Find the average distance
  const avgDistance = distances.reduce((acc, curr) => acc + curr, 0) / distances.length;
  // Use average distance to determine the letter
  if (avgDistance < 50) return 'A';
  else if (avgDistance < 80) return 'B';
  else if (avgDistance < 100) return 'C';
  else if (avgDistance < 120) return 'D';
  else if (avgDistance < 140) return 'E';
  else if (avgDistance < 160) return 'F';
  else if (avgDistance < 180) return 'G';
  else if (avgDistance < 200) return 'H';
  else if (avgDistance < 220) return 'I';
  else if (avgDistance < 240) return 'J';
  else if (avgDistance < 260) return 'K';
  else if (avgDistance < 280) return 'L';
  else if (avgDistance < 300) return 'M';
  else if (avgDistance < 320) return 'N';
  else if (avgDistance < 340) return 'O';
  else if (avgDistance < 360) return 'P';
  else if (avgDistance < 380) return 'Q';
  else if (avgDistance < 400) return 'R';
  else if (avgDistance < 420) return 'S';
  else if (avgDistance < 440) return 'T';
  else if (avgDistance < 460) return 'U';
  else if (avgDistance < 480) return 'V';
  else if (avgDistance < 500) return 'W';
  else if (avgDistance < 520) return 'X';
  else if (avgDistance < 540) return 'Y';
  else return 'Z';
}

// Event listener for hand sign button
handSignButton.addEventListener('click', function () {
  detectHandSign();
});

// Load Handpose model when the page is loaded
loadHandposeModel();



