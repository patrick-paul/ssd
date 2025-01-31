// main.js

// Message interface handling
// Contributors data
const contributors = [
  {
    sn: 1,
    name: "Patrick Paul",
    social: "https://x.com/patric_forreal",
    handle: "@patric_forreal",
    isLeader: true,
  },
  {
    sn: 2,
    name: "Plensia Ponsiano",
    social: "https://www.linkedin.com/in/plensia-lukosi",
    handle: "@plensiaponsiano",
  },
  {
    sn: 3,
    name: "Bilali Deonis",
    social: "https://x.com/bilali_mr39978",
    handle: "@bilalideonis",
  },
  {
    sn: 4,
    name: "Enock Clay",
    social: "https://x.com/TakeoffYrn15",
    handle: "@enockclay",
  },
  {
    sn: 5,
    name: "Frank Belnard",
    social: "https://www.instagram.com/chengula7420",
    handle: "@frankbelnard",
  },
  {
    sn: 6,
    name: "Msafiri Ally",
    social:
      "https://www.facebook.com/people/Msafiri-Fundi/pfbid02o8r6SN4M9wxEgZEheSy2S5BjEtpugvpPpJrZTTGY4KMVv7cw7Rsb22Fc86HK3cFol/",
    handle: "@MsafiriFundi",
  },
  {
    sn: 7,
    name: "Elizabeth Sabsteka",
    social: "https://www.facebook.com/profile.php?id=61552682181038",
    handle: "@elizabethsabsteka",
  },
  {
    sn: 8,
    name: "Samson Carlos",
    social: "https://www.facebook.com/samson.haule.90",
    handle: "@samsoncarlos",
  },
  {
    sn: 9,
    name: "Henry Harrison",
    social: "https://x.com/Henry05901064",
    handle: "@henryharrison",
  },
  {
    sn: 10,
    name: "Pilly Sona Chacha",
    social: "",
    handle: "-",
  },
  {
    sn: 11,
    name: "Juma Rashid Msigwa",
    social: "",
    handle: "-",
  },
  {
    sn: 12,
    name: "Happiness Israel Peramiho",
    social: "",
    handle: "-",
  },
];

let currentInterfaceId = null;

function generateInterfaceId() {
  return `interface_${Date.now()}`;
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageDate(date) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return messageDate.toLocaleDateString();
}

function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function showError(message = "Imeshindwa kutuma mrejesho") {
  Swal.fire({
    icon: "error",
    title: "Tatizo",
    text: message,
    confirmButtonColor: "#d33",
    confirmButtonText: "Sawa",
    background: "#1e1e2f",
    color: "#fff",
  });
}

function renderHistoryMessage(messageData) {
  // Clear existing messages
  document.getElementById("chat-messages").innerHTML = "";

  const sidebar = document.querySelector("#sidebar");
  if (sidebar.classList.contains("active")) {
    toggleSidebar();
  }

  // Show loader
  const loaderDiv = document.createElement("div");
  loaderDiv.className = "loader-overlay";
  loaderDiv.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  `;
  loaderDiv.innerHTML = `<div class="loader"></div>`;

  const chatContainer = document.getElementById("chat-container");
  chatContainer.style.position = "relative"; // Ensure relative positioning
  chatContainer.appendChild(loaderDiv);
  const chatMessages = document.getElementById("chat-messages");
  // Wait for 2.5 seconds before showing the messages
  setTimeout(() => {
    // Remove loader
    loaderDiv.remove();

    // Create centered history tag
    const historyTag = document.createElement("div");
    historyTag.style.textAlign = "center";
    historyTag.style.margin = "20px 0";
    historyTag.style.color = "#666";
    historyTag.style.fontSize = "14px";
    historyTag.innerHTML = "Historia ya Chambuzi";

    // Create user message
    const userMessageDiv = document.createElement("div");
    userMessageDiv.className = "message user";
    userMessageDiv.innerHTML = `
      <div class="user-message">
        ${messageData.message}
        <div class="timestamp" style="text-align: right;">
          ${formatTime(new Date(messageData.date))}
        </div>
      </div>
    `;

    // Create bot message
    const botMessageDiv = document.createElement("div");
    botMessageDiv.className = "message bot";
    botMessageDiv.dataset.id = messageData.id;

    const colorStyle =
      messageData.output === "UTAPELI" ? "color: #f03a17;" : "color: #16c60c;";

    botMessageDiv.innerHTML = `
      <div class="avatar">SSD</div>
      <div class="prediction-result">
        <div class="prediction-text">
          Utabiri: <span style="${colorStyle}">${messageData.output}</span>
        </div>
        <div class="timestamp" style="text-align: right;">
          ${formatTime(new Date(messageData.date))}
        </div>
      </div>
    `;

    // Append messages in order: history tag, user message, bot message
    chatMessages.appendChild(historyTag);
    chatMessages.appendChild(userMessageDiv);
    chatMessages.appendChild(botMessageDiv);

    // Scroll to the newly added messages
    const chatContainer = document.querySelector(".chat-container");
    requestAnimationFrame(() => {
      botMessageDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, 500); // .5 seconds delay
}

// Add these at the TOP LEVEL of the script (outside DOMContentLoaded)
async function handleFeedback(buttonElement, isCorrect) {
  const messageElement = buttonElement.closest(".message");
  const predictionId = messageElement.dataset.id;
  const predictionText =
    messageElement.querySelector(".prediction-text").textContent;
  const feedbackButtons = messageElement.querySelector(".feedback-buttons");

  // Disable both buttons during processing
  const buttons = feedbackButtons.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));

  try {
    const response = await fetch("/feedback", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: predictionId,
        isTrue: isCorrect,
        predicted_value: predictionText.includes("SIO UTAPELI")
          ? "SIO UTAPELI"
          : "UTAPELI",
      }),
    });

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!response.ok) throw new Error("Feedback submission failed");

    // Replace feedback buttons with confirmation message
    feedbackButtons.innerHTML = `
      <div class="feedback-confirmation">
        ${isCorrect ? "✅ Asante kwa mrejesho wako!" : "❌ Tutarekebisha hilo!"}
      </div>
    `;
  } catch (error) {
    console.error("Feedback error:", error);
    // Re-enable buttons on error
    buttons.forEach((btn) => (btn.disabled = false));
    showError("Imeshindwa kutuma mrejesho");
  }
}

window.handleLogout = async function () {
  try {
    const response = await fetch("/auth/logout", { credentials: "include" });
    if (!response.ok) throw new Error("Can't log out!");

    const data = await response.json();
    if (data.success) window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitBtn");
  const textInput = document.querySelector(".input");
  const chatMessages = document.getElementById("chat-messages");
  const validationHistory = document.getElementById("validation-history");

  // Initialize
  loadValidationHistory();
  updateSubmitButtonState();

  // Event Listeners
  textInput.addEventListener("input", updateSubmitButtonState);
  submitBtn.addEventListener("click", handleSubmission);

  document.getElementById("newNumberToggle").addEventListener("change", () => {
    localStorage.setItem(
      "newNumberDefault",
      document.getElementById("newNumberToggle").checked
    );
  });

  // Load default toggle state
  const savedToggleState = localStorage.getItem("newNumberDefault");
  if (savedToggleState !== null) {
    document.getElementById("newNumberToggle").checked =
      savedToggleState === "true";
  } else {
    document.getElementById("newNumberToggle").checked = true;
  }

  textInput.addEventListener("input", function () {
    // Reset height temporarily to get the correct scrollHeight
    this.style.height = "auto";

    // Get the computed styles once
    const computedStyle = window.getComputedStyle(this);
    const lineHeight = parseInt(computedStyle.lineHeight, 10);

    // Calculate border and padding to account for box-sizing
    const borderHeight =
      parseInt(computedStyle.borderTopWidth, 10) +
      parseInt(computedStyle.borderBottomWidth, 10);
    const padding =
      parseInt(computedStyle.paddingTop, 10) +
      parseInt(computedStyle.paddingBottom, 10);

    // Set minimum height of one line plus borders and padding
    const minHeight = lineHeight + borderHeight + padding;

    // Set new height based on content
    const newHeight = Math.max(minHeight, this.scrollHeight);
    this.style.height = newHeight + "px";
  });

  async function handleSubmission() {
    const message = textInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, "user");

    // Add typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "message bot";
    typingIndicator.id = "typing-indicator";
    typingIndicator.innerHTML = `
        <div class="avatar">SSD</div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    // Ensure the DOM updates before scrolling

    const chatContainer = document.querySelector(".chat-container");
    requestAnimationFrame(() => {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    });

    // Clear input and reset height
    textInput.value = "";
    textInput.style.height = "auto";
    updateSubmitButtonState();

    const isNewNumber = document.getElementById("newNumberToggle").checked;
    const delay = Math.random() * (3000 - 1500) + 1500; // Random delay between 1.5-3 seconds

    try {
      const response = await fetch("/predict", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, newNumber: isNewNumber }),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      // Wait for minimum delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Request failed");
      }

      const data = await response.json();

      // Remove typing indicator
      document.getElementById("typing-indicator")?.remove();

      // Add bot response
      addMessage(data.prediction, "bot", data.id);
      // Ensure the DOM updates before scrolling

      const chatContainer = document.querySelector(".chat-container");
      requestAnimationFrame(() => {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      });
      addToHistory(message, data.prediction);
      loadValidationHistory();
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("typing-indicator")?.remove();
      showError(error.message || "Hitilafu ya mtandao. Tafadhali jaribu tena.");
    }
  }

  // Update message rendering
  function addMessage(content, type, id = null) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    if (id) messageDiv.dataset.id = id;

    const time = formatTime(new Date());

    if (type === "user") {
      messageDiv.innerHTML = `
        <div class="user-message">
          ${content}
          <div class="timestamp" style="text-align: right;">
            ${time}
          </div>
        </div>
      `;
    } else {
      const colorStyle =
        content === "UTAPELI" ? "color: #f03a17;" : "color: #16c60c;";

      messageDiv.innerHTML = `
        <div class="avatar">SSD</div>
        <div class="prediction-result">
          <div class="prediction-text">
            Utabiri: <span style="${colorStyle}">${content}</span>
          </div>
          <div class="feedback-buttons">
            <button class="feedback-btn" onclick="handleFeedback(this, true)">
              <span>Ndio</span> ✅
            </button>
            <button class="feedback-btn" onclick="handleFeedback(this, false)">
              <span>Hapana</span> ❌
            </button>
          </div>
          <div class="timestamp" style="text-align: right;">
            ${time}
          </div>
        </div>
      `;
    }

    const chatMessages = document.getElementById("chat-messages");
    chatMessages.appendChild(messageDiv);
    // Ensure the DOM updates before scrolling

    const chatContainer = document.querySelector(".chat-container");
    requestAnimationFrame(() => {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  // Add Enter key handling
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textInput.value.trim()) {
        handleSubmission();
      }
    }
  });

  function groupMessagesByDate(messages) {
    return messages.reduce((groups, msg) => {
      const date = formatMessageDate(msg.date);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
      return groups;
    }, {});
  }

  async function handleFeedback(buttonElement, isCorrect) {
    const messageElement = buttonElement.closest(".message");
    const predictionId = messageElement.dataset.id;
    const predictionText =
      messageElement.querySelector(".prediction-text").textContent;

    showLoader();
    setTimeout(() => {
      hideLoader(); // Hide the loader after 3 seconds
    }, Math.random() * (5000 - 3000) + 3000);

    try {
      const response = await fetch("/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: predictionId,
          isTrue: isCorrect,
          predicted_value: predictionText.includes("UTAPELI")
            ? "UTAPELI"
            : "SIO UTAPELI",
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Feedback submission failed");
      }

      // Visual feedback
      buttonElement.disabled = true;
      buttonElement.style.opacity = "0.6";
      buttonElement.innerHTML = isCorrect ? "✅ Imetumwa" : "❌ Imetumwa";
      showConfirmation(
        isCorrect ? "Asante kwa mrejesho wako!" : "Tutatengeneza hilo!"
      );
    } catch (error) {
      console.error("Feedback error:", error);
      showError(error.message || "Imeshindwa kutuma mrejesho");
    } finally {
      hideLoader();
    }
  }

  function addToHistory(message, prediction) {
    const messageData = {
      message: message,
      date: new Date().toISOString(),
      output: prediction,
      id: generateInterfaceId(),
    };

    const historyItem = document.createElement("div");
    historyItem.className = "chat-item";
    historyItem.dataset.message = JSON.stringify(messageData);

    const color = prediction === "UTAPELI" ? "#f03a17" : "#16c60c";

    historyItem.innerHTML = `
      <div>${
        message.length > 40 ? message.substring(0, 40) + "..." : message
      }</div>
      <small style="color: ${color}">${prediction}</small>
    `;

    historyItem.addEventListener("click", () => {
      renderHistoryMessage(messageData);
    });

    validationHistory.prepend(historyItem);
  }

  async function loadValidationHistory() {
    const validationHistory = document.getElementById("validation-history");
    const loader = validationHistory.querySelector(".history-loader");

    // Show loader
    if (loader) {
      loader.classList.add("active");
    }

    try {
      const response = await fetch("/user/history", { credentials: "include" });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      // Update the user name in the dropdown header
      const userNameHeader = document.getElementById("user-name-header");
      if (userNameHeader && data.name) {
        userNameHeader.textContent = data.name;
      }

      // Sort messages if not already in reverse order (most recent first)
      data.messages.reverse();

      // Create history HTML
      const historyHTML = data.messages
        .map(
          (msg) => `
            <div class="chat-item" data-message='${JSON.stringify(msg)}'>
              <div class="chat-item-content">${
                msg.message.length > 12
                  ? msg.message.substring(0, 12) + "..."
                  : msg.message
              }</div>
              <div class="chat-item-status ${
                msg.output === "UTAPELI" ? "danger" : ""
              }">
                ${msg.output}
              </div>
            </div>
          `
        )
        .join("");

      // Hide loader and update content
      if (loader) {
        loader.classList.remove("active");
      }

      // Insert new content
      validationHistory.innerHTML = historyHTML;

      // Add click event listeners to all chat items
      document.querySelectorAll(".chat-item").forEach((item) => {
        item.addEventListener("click", function () {
          const messageData = JSON.parse(this.dataset.message);
          renderHistoryMessage(messageData);
        });
      });
    } catch (error) {
      console.error("Error loading history:", error);
      // Hide loader on error
      if (loader) {
        loader.classList.remove("active");
      }

      // Show error message in history area
      validationHistory.innerHTML = `
        <div class="chat-item error">
          <div>Failed to load history. Please try again.</div>
        </div>
      `;
    }
  }

  // Helper functions
  function updateSubmitButtonState() {
    submitBtn.disabled = textInput.value.trim().length === 0;
  }

  function showConfirmation(message) {
    const confirmation = document.createElement("div");
    confirmation.className = "message bot";
    confirmation.innerHTML = `
        <div class="prediction-result">
          <div>${message}</div>
        </div>
      `;
    chatMessages.appendChild(confirmation);
    // Ensure the DOM updates before scrolling

    const chatContainer = document.querySelector(".chat-container");
    requestAnimationFrame(() => {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }
});

// Modal functionality
function showContributors() {
  const modal = document.getElementById("contributors-modal");
  const list = modal.querySelector(".contributors-list");

  list.innerHTML = `
    <table class="contributors-table">
      <thead>
        <tr>
          <th>S/N</th>
          <th>Name</th>
          <th>Social</th>
        </tr>
      </thead>
      <tbody>
        ${contributors
          .map(
            (c) => `
          <tr>
            <td>${c.sn}</td>
            <td>${c.name}${
              c.isLeader ? '<span class="leader">Kiongozi</span>' : ""
            }</td>
            <td>
              ${
                c.social
                  ? `<a href="${c.social}" target="_blank" rel="noopener noreferrer">${c.handle}</a>`
                  : "-"
              }
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  modal.style.display = "block";
}

const input = document.querySelector(".input");

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && input.value.trim()) {
    // Handle message send
    input.value = "";
  }
});

function toggleDropdown() {
  const dropdown = document.getElementById("dropdown");
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
}

document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("dropdown");
  const profile = document.querySelector(".profile");
  if (!profile.contains(e.target)) {
    dropdown.style.display = "none";
  }
});

function closeModal() {
  document.getElementById("contributors-modal").style.display = "none";
}

function clearHistory() {
  const validationHistory = document.getElementById("validation-history");

  if (validationHistory && validationHistory.hasChildNodes()) {
    // SweetAlert for confirmation
    Swal.fire({
      title: "Unauhakika?",
      text: "Hatua hii itafuta chambuzi zote za awali!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4466ff",
      confirmButtonColor: "#f03a19",
      confirmButtonText: "Ndio, futa!",
      cancelButtonText: "Ghairi",
      background: "#333",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        // Fetch request to clear history
        fetch("/clear-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: localStorage.getItem("username") }),
        })
          .then((response) => {
            if (response.status === 401) {
              window.location.href = "/login";
              return;
            }

            if (response.ok) {
              Swal.fire({
                title: "Zimefutwa!",
                text: "Chambuzi za awali zimefutwa.",
                icon: "success",
                confirmButtonText: "Sawa",
                background: "#333",
                color: "#fff",
              });

              document.getElementById("validation-history").innerHTML = "";
              document.getElementById("chat-messages").innerHTML = "";
            } else {
              Swal.fire({
                title: "Tatizo!",
                text: "Tumeshidwa futa chambuzi, jaribu tena.",
                confirmButtonText: "Sawa",
                icon: "error",
                background: "#333",
                color: "#fff",
              });
            }
          })
          .catch((error) => {
            console.error("Error clearing history:", error);
            Swal.fire({
              title: "Tatizo!",
              text: "Kuna tatizo limetokea, jaribu tena.",
              icon: "error",
              confirmButtonText: "Sawa",
              background: "#333",
              color: "#fff",
            });
          });
      }
    });
  } else {
    Swal.fire({
      title: "Hakuna cha kufuta!",
      text: "Hakuna chambuzi za awali zakufuta.",
      confirmButtonText: "Sawa",
      icon: "warning",
      background: "#333",
      color: "#fff",
    });
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("contributors-modal");
  if (event.target === modal) {
    closeModal();
  }
};

// Add sidebar toggle functionality
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");

  sidebar.classList.toggle("active");

  if (sidebar.classList.contains("active")) {
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
  } else {
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close sidebar when clicking history items
document.querySelectorAll(".chat-item").forEach((item) => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  });
});

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    sidebar.classList.remove("active");
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
