document.addEventListener("DOMContentLoaded", function () {
  // Highlight active nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Navigation handling
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      showSection(section);
    });
  });
});

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Show selected section
  document.getElementById(sectionId).classList.add("active");

  // Update active nav button
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector(`[data-section="${sectionId}"]`)
    .classList.add("active");
}

// Common formatting function for all AI responses
function formatAIResponse(content) {
  const formattedContent = content
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return "<br>";
      if (line.startsWith("# ")) {
        return `<h3 class="mt-4">${line.substring(2)}</h3>`;
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

  return formattedContent;
}

// Add typewriter effect function
async function typewriterEffect(element, html, speed = 30) {
  element.innerHTML = "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const textNodes = [];

  function extractTextNodes(node) {
    if (node.nodeType === 3) {
      // Text node
      textNodes.push({ text: node.textContent, parent: node.parentNode });
    } else {
      node.childNodes.forEach((child) => extractTextNodes(child));
    }
  }

  extractTextNodes(tempDiv);
  element.innerHTML = html;
  const contentElements = element.querySelectorAll("p, h3, br");

  for (let elem of contentElements) {
    elem.style.opacity = "0";
  }

  for (let elem of contentElements) {
    elem.style.opacity = "1";
    await new Promise((resolve) => setTimeout(resolve, speed * 10));
  }
}

// Update the result display functions
async function displayFormattedResponse(containerId, content) {
  showLoading();

  const adviceContent = document.querySelector(".advice-content");
  const sections = formatAIResponse(content).split("<h3");

  adviceContent.innerHTML = "";

  // Process each section
  for (let i = 0; i < sections.length; i++) {
    if (i === 0) continue; // Skip first empty split
    const section = document.createElement("div");
    section.className = "advice-section";
    section.style.setProperty("--animation-order", i);
    section.innerHTML = "<h3" + sections[i];
    adviceContent.appendChild(section);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  hideLoading();
}

// Add this function near the top with other utility functions
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error alert alert-danger";
  errorDiv.textContent = message;

  // Find the relevant result container
  const containers = [
    "advice-result",
    "water-advice-result",
    "image-analysis-result",
    "disease-result",
    "bio-fertilizer-result",
    "schemes-result",
  ];

  for (const id of containers) {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = "";
      container.appendChild(errorDiv);
      break;
    }
  }

  // Auto-remove the error after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}

// Update existing API call handlers
function getAgricultureAdvice() {
  const question = document.getElementById("agri-question").value;
  if (!question) {
    showError("Please enter your question");
    return;
  }

  fetch("/get-advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `question=${encodeURIComponent(question)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);
      displayFormattedResponse("advice-result", data.advice);
    })
    .catch((error) => showError(error.message));
}

function getWaterAdvice() {
  const cropType = document.getElementById("crop-type").value;
  const soilType = document.getElementById("soil-type").value;

  if (!cropType || !soilType) {
    showError("Please fill in all fields");
    return;
  }

  fetch("/water-management", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `crop_type=${encodeURIComponent(
      cropType
    )}&soil_type=${encodeURIComponent(soilType)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);
      displayFormattedResponse("water-advice-result", data.advice);
    })
    .catch((error) => showError(error.message));
}

function analyzeImage() {
  const fileInput = document.getElementById("crop-image");
  if (!fileInput.files[0]) {
    showError("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  fetch("/analyze-image", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);
      const content = `# Crop Identified\n${data.crop_identified}\n\n${data.sustainable_advice}`;
      displayFormattedResponse("image-analysis-result", content);
    })
    .catch((error) => showError(error.message));
}

async function analyzeDiseaseImage() {
  const fileInput = document.getElementById("disease-image");
  if (!fileInput.files[0]) {
    showError("Please select an image");
    return;
  }

  // Show loading indicator
  document.getElementById("loadingIndicator").style.display = "block";

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  try {
    const response = await fetch("/analyze-disease", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // Format the content similar to image analysis
    const content = `# Disease Analysis Results\n${data.diagnosis}`;
    await displayFormattedResponse("disease-result", content);

    // Show the advice container
    document.querySelector(".advice").style.display = "block";
  } catch (error) {
    showError(error.message);
  } finally {
    // Hide loading indicator
    document.getElementById("loadingIndicator").style.display = "none";
  }
}

function getBioFertilizerAdvice() {
  const cropType = document.getElementById("bio-crop-type").value;
  const soilType = document.getElementById("bio-soil-type").value;
  const growthStage = document.getElementById("growth-stage").value;

  if (!cropType || !soilType || !growthStage) {
    showError("Please fill in all fields");
    return;
  }

  // Show loading state
  const loadingOverlay = document.querySelector(".loading-overlay");
  const adviceContainer = document.querySelector(".advice");
  loadingOverlay.style.display = "flex";
  adviceContainer.style.display = "none";

  fetch("/bio-fertilizer", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `crop_type=${encodeURIComponent(
      cropType
    )}&soil_type=${encodeURIComponent(
      soilType
    )}&growth_stage=${encodeURIComponent(growthStage)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);
      displayFormattedResponse("bio-fertilizer-result", data.advice);
      // Show the advice container
      document.querySelector(".advice").style.display = "block";
    })
    .catch((error) => {
      showError(error.message);
      loadingOverlay.style.display = "none";
    });
}

// Schemes Information Function
async function getSchemeInfo() {
  const state = document.getElementById("state").value;
  const category = document.getElementById("scheme-category").value;

  if (!state || !category) {
    showError("Please select both state and category");
    return;
  }

  // Show loading state
  const loadingOverlay = document.querySelector(".loading-overlay");
  const adviceContainer = document.querySelector(".advice");
  if (loadingOverlay && adviceContainer) {
    loadingOverlay.style.display = "flex";
    adviceContainer.style.display = "none";
  }

  try {
    const response = await fetch("/schemes", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `state=${encodeURIComponent(state)}&category=${encodeURIComponent(
        category
      )}`,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    await displayFormattedResponse("schemes-result", data.schemes);
    // Show the advice container
    const adviceDiv = document.querySelector(".advice");
    if (adviceDiv) {
      adviceDiv.style.display = "block";
    }
  } catch (error) {
    showError(error.message);
  } finally {
    // Hide loading overlay
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }
  }
}

// Add these new functions

function showLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  const adviceContainer = document.querySelector(".advice");
  loadingOverlay.style.display = "flex";
  adviceContainer.style.display = "none";
}

function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  const adviceContainer = document.querySelector(".advice");
  loadingOverlay.style.display = "none";
  adviceContainer.style.display = "block";
}

function copyResponse() {
  const content = document.querySelector(".advice-content").innerText;
  navigator.clipboard
    .writeText(content)
    .then(() => {
      showToast("Advice copied to clipboard!");
    })
    .catch((err) => {
      showToast("Failed to copy text");
    });
}

function shareResponse() {
  if (navigator.share) {
    navigator
      .share({
        title: "Agriculture Advice",
        text: document.querySelector(".advice-content").innerText,
        url: window.location.href,
      })
      .catch(console.error);
  } else {
    showToast("Sharing not supported on this browser");
  }
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Add styles for toast messages
const style = document.createElement("style");
style.textContent = `
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

async function getWeatherData() {
  const city = document.getElementById("weather-city").value;
  if (!city) {
    showError("Please enter a city name");
    return;
  }

  try {
    const response = await fetch("/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `city=${encodeURIComponent(city)}`,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    displayWeatherData(data);
    document.getElementById("weather-data").style.display = "flex";
  } catch (error) {
    showError(error.message);
  }
}

function displayWeatherData(data) {
  // Temperature Card
  document.getElementById("temperature-data").innerHTML = `
        <div class="weather-value">${data.temperature_data.current}°C</div>
        <div class="weather-trend">
            <i class="bi bi-arrow-${
              data.temperature_data.trend === "rising" ? "up" : "down"
            } ${
    data.temperature_data.trend === "rising" ? "trend-up" : "trend-down"
  }"></i>
            Trend: ${data.temperature_data.trend}
        </div>
        <small>Range: ${data.temperature_data.min}°C - ${
    data.temperature_data.max
  }°C</small>
    `;

  // Humidity Card
  document.getElementById("humidity-data").innerHTML = `
        <div class="weather-value">${data.humidity_data.current}%</div>
        <div class="weather-trend">
            <i class="bi bi-arrow-${
              data.humidity_data.trend === "rising" ? "up" : "down"
            } ${
    data.humidity_data.trend === "rising" ? "trend-up" : "trend-down"
  }"></i>
            Trend: ${data.humidity_data.trend}
        </div>
        <small>High humidity: ${data.humidity_data.high_humidity_hours}h</small>
    `;

  // Conditions Card
  document.getElementById("conditions-data").innerHTML = `
        <div class="weather-value">${data.weather_conditions.current}</div>
        <div class="weather-trend">
            <i class="bi bi-cloud-rain"></i>
            Rain chance: ${data.weather_conditions.precipitation_probability}%
        </div>
        <small>Wind: ${data.water_management.wind_speed} m/s</small>
    `;
}
