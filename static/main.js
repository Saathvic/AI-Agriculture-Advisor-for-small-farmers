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
  const container = document.getElementById(containerId);
  container.innerHTML = '<div class="advice"></div>';
  const adviceDiv = container.querySelector(".advice");

  // Format and display the content
  const formattedContent = formatAIResponse(content);
  adviceDiv.innerHTML = formattedContent;

  // Apply fade-in effect to each element
  const elements = adviceDiv.querySelectorAll("p, h3, br");
  elements.forEach((elem) => {
    elem.style.opacity = "0";
    elem.style.transition = "opacity 0.5s ease-in-out";
  });

  // Fade in elements one by one
  for (let elem of elements) {
    elem.style.opacity = "1";
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
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

function analyzeDiseaseImage() {
  const fileInput = document.getElementById("disease-image");
  if (!fileInput.files[0]) {
    showError("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  fetch("/analyze-disease", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);
      displayFormattedResponse("disease-result", data.diagnosis);
    })
    .catch((error) => showError(error.message));
}

function getBioFertilizerAdvice() {
  const cropType = document.getElementById("bio-crop-type").value;
  const soilType = document.getElementById("bio-soil-type").value;
  const growthStage = document.getElementById("growth-stage").value;

  if (!cropType || !soilType || !growthStage) {
    showError("Please fill in all fields");
    return;
  }

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
    })
    .catch((error) => showError(error.message));
}

// Schemes Information Function
async function getSchemeInfo() {
  const state = document.getElementById("state").value;
  const category = document.getElementById("scheme-category").value;
  const resultDiv = document.getElementById("schemes-result");

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
    if (data.error) {
      throw new Error(data.error);
    }

    // Format the response with proper HTML structure
    const formattedResponse = `
        <div class="schemes-container">
            ${data.schemes
              .split("**")
              .map((text, index) => {
                if (index % 2 === 1) {
                  // This is a header/bold text
                  return `<h3>${text}</h3>`;
                } else {
                  // Format normal text and lists
                  return text
                    .replace(/\* /g, "<li>")
                    .replace(/\n\*/g, "\n<li>")
                    .replace(/\n([^<])/g, "</li>\n$1")
                    .replace(/([^>])\n/g, "$1</li>\n")
                    .replace(/• /g, "<li>")
                    .split("\n")
                    .map((line) => {
                      if (line.trim().startsWith("<li>")) {
                        return `<ul>${line}</ul>`;
                      }
                      return `<p>${line}</p>`;
                    })
                    .join("");
                }
              })
              .join("")}
        </div>`;

    displayFormattedResponse("schemes-result", data.schemes);
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">${error.message}</div>`;
  }
}
