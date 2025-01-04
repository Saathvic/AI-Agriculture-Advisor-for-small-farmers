// Typewriter effect function with configurable speed and cursor
async function typewriterEffect(element, text, speed = 30) {
  let i = 0;
  element.innerHTML = "";
  element.classList.add("typing");

  return new Promise((resolve) => {
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        element.classList.remove("typing");
        resolve();
      }
    }
    type();
  });
}

// Enhanced response formatter with HTML parsing
function formatAIResponse(content) {
  return content
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return "<br>";
      if (line.startsWith("# ")) {
        return `<h3 class="mt-4 mb-3">${line.substring(2)}</h3>`;
      }
      if (/^\d+\.\s\*\*.*\*\*/.test(line)) {
        return line.replace(
          /(\d+\.\s)\*\*(.*?)\*\*(.*)/,
          '<p class="mb-2">$1<strong>$2</strong>$3</p>'
        );
      }
      if (line.startsWith("- **")) {
        return line.replace(
          /- \*\*(.*?)\*\*(.*)/,
          '<p class="mb-2">• <strong>$1</strong>$2</p>'
        );
      }
      return `<p class="mb-2">${line.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      )}</p>`;
    })
    .join("");
}

// Unified display function for all features
async function displayFormattedResponse(containerId, content) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const adviceContent = container.querySelector(".advice-content") || container;
  const loadingOverlay = document.querySelector(".loading-overlay");

  // Parse and prepare content
  const formattedContent = formatAIResponse(content);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = formattedContent;

  // Clear existing content
  adviceContent.innerHTML = "";

  // Hide loading overlay as we begin typing
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }

  // Show advice container
  const adviceContainer = document.querySelector(".advice");
  if (adviceContainer) {
    adviceContainer.style.display = "block";
  }

  // Type each element
  for (let child of tempDiv.children) {
    const element = document.createElement(child.tagName);
    element.className = child.className;
    adviceContent.appendChild(element);
    await typewriterEffect(element, child.textContent, 10);
  }
}

// Enhanced feature handlers
async function getAgricultureAdvice() {
  const question = document.getElementById("agri-question").value;
  if (!question) {
    showError("Please enter your question");
    return;
  }

  showLoading();

  try {
    const response = await fetch("/get-advice", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `question=${encodeURIComponent(question)}`,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    await displayFormattedResponse("advice-result", data.advice);
  } catch (error) {
    showError(error.message);
    hideLoading();
  }
}

async function getWaterAdvice() {
  const cropType = document.getElementById("crop-type").value;
  const soilType = document.getElementById("soil-type").value;

  if (!cropType || !soilType) {
    showError("Please fill in all fields");
    return;
  }

  showLoading();

  try {
    const response = await fetch("/water-management", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `crop_type=${encodeURIComponent(
        cropType
      )}&soil_type=${encodeURIComponent(soilType)}`,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    await displayFormattedResponse("water-advice-result", data.advice);
  } catch (error) {
    showError(error.message);
    hideLoading();
  }
}

async function analyzeImage() {
  const fileInput = document.getElementById("crop-image");
  if (!fileInput.files[0]) {
    showError("Please select an image");
    return;
  }

  showLoading();

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  try {
    const response = await fetch("/analyze-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const content = `# Crop Identified\n${data.crop_identified}\n\n${data.sustainable_advice}`;
    await displayFormattedResponse("image-analysis-result", content);
  } catch (error) {
    showError(error.message);
    hideLoading();
  }
}

async function analyzeDiseaseImage() {
  const fileInput = document.getElementById("disease-image");
  if (!fileInput.files[0]) {
    showError("Please select an image");
    return;
  }

  showLoading();

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  try {
    const response = await fetch("/analyze-disease", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const content = `# Disease Analysis Results\n${data.diagnosis}`;
    await displayFormattedResponse("disease-result", content);
  } catch (error) {
    showError(error.message);
    hideLoading();
  }
}

async function getBioFertilizerAdvice() {
  const cropType = document.getElementById("bio-crop-type").value;
  const soilType = document.getElementById("bio-soil-type").value;
  const growthStage = document.getElementById("growth-stage").value;

  if (!cropType || !soilType || !growthStage) {
    showError("Please fill in all fields");
    return;
  }

  showLoading();

  try {
    const response = await fetch("/bio-fertilizer", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `crop_type=${encodeURIComponent(
        cropType
      )}&soil_type=${encodeURIComponent(
        soilType
      )}&growth_stage=${encodeURIComponent(growthStage)}`,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    await displayFormattedResponse("bio-fertilizer-result", data.advice);
  } catch (error) {
    showError(error.message);
    hideLoading();
  }
}

async function getSchemeInfo() {
  const state = document.getElementById("state").value;
  const category = document.getElementById("scheme-category").value;

  if (!state || !category) {
    showError("Please select both state and category");
    return;
  }

  showLoading();

  try {
    const response = await fetch("/schemes", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `state=${encodeURIComponent(state)}&category=${encodeURIComponent(
        category
      )}`,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    await displayFormattedResponse("schemes-result", data.schemes);
  } catch (error) {
    showError(error.message);
    hideLoading();
  }
}

// Utility functions
function showLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  const adviceContainer = document.querySelector(".advice");
  if (loadingOverlay && adviceContainer) {
    loadingOverlay.style.display = "flex";
    adviceContainer.style.display = "none";
  }
}

function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }
}

// Add necessary styles
const style = document.createElement("style");
style.textContent = `
  .typing::after {
    content: '|';
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .toast-message {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(44, 89, 20, 0.9);
    color: white;
    padding: 1rem 2rem;
    border-radius: 25px;
    z-index: 1000;
    animation: fadeInOut 3s ease-in-out;
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
  }
`;
document.head.appendChild(style);
