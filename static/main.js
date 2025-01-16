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

// Enhanced response formatter with HTML parsing and URL detection
function formatAIResponse(content) {
  // Save existing anchor tags by replacing them temporarily
  let anchorTags = [];
  content = content.replace(
    /<a\s+(?:[^>]*?)href="([^"]*)"(?:[^>]*?)>([^<]*)<\/a>/gi,
    (match) => {
      anchorTags.push(match);
      return `{{ANCHOR_${anchorTags.length - 1}}}`;
    }
  );

  // Enhanced URL pattern that catches "Visit:" and "Portal:" prefixes
  const urlPattern =
    /(?:Visit:|Portal:)\s+(https?:\/\/[^\s]+)|(?:https?:\/\/[^\s]+)|(?:www\.[^\s]+)/gi;

  function formatUrl(match, url) {
    // If url is undefined, the match didn't have a prefix
    if (!url) {
      url = match;
    }

    // Add https:// if missing
    if (!url.match(/^https?:\/\//)) {
      url = "https://" + url;
    }

    // Get the display text (remove trailing punctuation)
    const displayUrl = url.replace(/[.,]+$/, "");

    // Create the link with scheme-link class
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="scheme-link">${displayUrl}</a>`;
  }

  const formattedContent = content
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return "<br>";

      // Format URLs in the line that aren't already in anchor tags
      line = line.replace(urlPattern, formatUrl);

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
      if (line.startsWith("* ")) {
        return line.replace(/\* (.*)/, '<p class="mb-2 ms-3">• $1</p>');
      }

      return `<p class="mb-2">${line.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      )}</p>`;
    })
    .join("");

  // Restore anchor tags
  return formattedContent.replace(
    /{{ANCHOR_(\d+)}}/g,
    (match, index) => anchorTags[parseInt(index)]
  );
}

// Updated displayFormattedResponse function with typewriter effect
async function displayFormattedResponse(containerId, content) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const adviceContent = container.querySelector(".advice-content") || container;
  const loadingOverlay = document.querySelector(".loading-overlay");

  // Hide loading overlay
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }

  // Show advice container
  const adviceContainer = document.querySelector(".advice");
  if (adviceContainer) {
    adviceContainer.style.display = "block";
  }

  // Parse and prepare content
  const formattedContent = formatAIResponse(content);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = formattedContent;

  // Clear existing content
  adviceContent.innerHTML = "";

  // Create a cursor element
  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  adviceContent.appendChild(cursor);

  // Type each element with HTML preservation
  for (const child of tempDiv.children) {
    const element = document.createElement(child.tagName);
    element.className = child.className;
    adviceContent.insertBefore(element, cursor);

    // Store the original HTML with formatting
    const originalHTML = child.innerHTML;

    // Type only the text content
    await typewriterEffect(element, child.textContent, 15);

    // Restore the HTML formatting after typing
    element.innerHTML = originalHTML;

    // Process any links in the element
    element.querySelectorAll("a").forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.classList.add("scheme-link");
    });

    // Add a small delay between elements
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Remove cursor after completion
  cursor.remove();
}

// Enhanced typewriter effect function
async function typewriterEffect(element, text, speed = 15) {
  let i = 0;
  element.textContent = "";

  return new Promise((resolve) => {
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

// Add cursor styles if not already present
const cursorStyle = document.createElement("style");
cursorStyle.textContent = `
  .typing-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: var(--primary-color);
    margin-left: 2px;
    animation: blink 1s infinite;
    vertical-align: middle;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;
document.head.appendChild(cursorStyle);

// Unified display function for all features
async function displayFormattedResponse(containerId, content) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const adviceContent = container.querySelector(".advice-content") || container;
  const loadingOverlay = document.querySelector(".loading-overlay");

  // Hide loading overlay
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }

  // Show advice container
  const adviceContainer = document.querySelector(".advice");
  if (adviceContainer) {
    adviceContainer.style.display = "block";
  }

  // Parse and prepare content
  const formattedContent = formatAIResponse(content);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = formattedContent;

  // Clear existing content
  adviceContent.innerHTML = "";

  // Create and append cursor element
  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  adviceContent.appendChild(cursor);

  // Type each element with cursor effect
  for (const child of tempDiv.children) {
    const element = document.createElement(child.tagName);
    element.className = child.className;
    adviceContent.insertBefore(element, cursor);

    // Store original HTML
    const originalHTML = child.innerHTML;
    const textContent = child.textContent;

    // Type the text content with cursor
    await new Promise((resolve) => {
      let i = 0;
      function typeChar() {
        if (i < textContent.length) {
          element.textContent += textContent[i];
          i++;
          setTimeout(typeChar, 15);
        } else {
          // Restore HTML formatting after typing
          element.innerHTML = originalHTML;
          // Process any links
          element.querySelectorAll("a").forEach((link) => {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
            link.classList.add("scheme-link");
          });
          resolve();
        }
      }
      typeChar();
    });

    // Add delay between elements
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Remove cursor after completion
  cursor.remove();
}

// Add cursor styles for typing effect
const cursorStyles = document.createElement("style");
cursorStyles.textContent = `
  .typing-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: var(--primary-color);
    margin-left: 2px;
    vertical-align: middle;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .advice-content {
    position: relative;
  }
`;
document.head.appendChild(cursorStyles);

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

// Add new weather functions without affecting existing code
async function getWeatherData() {
  const city = document.getElementById("weather-city").value;
  if (!city) {
    showToast("Please enter a city name");
    return;
  }

  const weatherData = document.getElementById("weather-data");
  weatherData.style.display = "none";
  showToast("Fetching weather data...");

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

    // Display weather data
    weatherData.style.display = "block";
    displayWeatherData(data);
  } catch (error) {
    showToast(error.message);
  }
}

function displayWeatherData(data) {
  const weatherDataEl = document.getElementById("weather-data");
  weatherDataEl.innerHTML = ""; // Clear old data

  const weatherGrid = document.createElement("div");
  weatherGrid.classList.add("weather-grid");

  // Add city name as header
  const cityHeader = document.createElement("div");
  cityHeader.className = "weather-header text-center mb-3";
  cityHeader.innerHTML = `<h5>${
    document.getElementById("weather-city").value
  }</h5>`;
  weatherDataEl.appendChild(cityHeader);

  // Loop through the 7-day forecast
  data.forecast.forEach((dayInfo) => {
    const dayCard = document.createElement("div");
    dayCard.classList.add("weather-card");

    // Format the date
    const dateObj = new Date(dayInfo.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Select weather icon based on condition
    const weatherIcon = getWeatherIcon(dayInfo.condition);

    dayCard.innerHTML = `
        <h6>${dayInfo.day}</h6>
        <small>${formattedDate}</small>
        <div class="weather-value">${dayInfo.temp}°C</div>
        <div class="weather-condition">
            <i class="bi ${weatherIcon}"></i>
            <span>${dayInfo.condition}</span>
        </div>
    `;
    weatherGrid.appendChild(dayCard);
  });

  weatherDataEl.appendChild(weatherGrid);
}

function getWeatherIcon(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("clear")) return "bi-sun";
  if (condition.includes("cloud")) return "bi-cloud";
  if (condition.includes("rain")) return "bi-cloud-rain";
  if (condition.includes("snow")) return "bi-snow";
  if (condition.includes("thunder")) return "bi-lightning";
  return "bi-cloud"; // default icon
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Make weather functions globally available
window.getWeatherData = getWeatherData;

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
