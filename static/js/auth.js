// auth.js
// Add this at the start of your auth.js file
document.addEventListener("DOMContentLoaded", () => {
  // Login form Enter key handler
  document.getElementById("loginForm").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  });

  // Register form Enter key handler
  document.getElementById("registerForm").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  });
});

function toggleForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  loginForm.classList.toggle("active-form");
  loginForm.classList.toggle("hidden-form");
  registerForm.classList.toggle("active-form");
  registerForm.classList.toggle("hidden-form");
}

async function handleLogin() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    document.querySelector("#handleLogInBtn").disabled = true;

    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      await Swal.fire({
        icon: "success",
        title: "Umefanikiwa kuingia",
        text: "Karibu tena!",
        confirmButtonText: "Sawa",
        showConfirmButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        background: "#1e1e2f",
        color: "#fff",
      }).then(() => {
        localStorage.setItem("username", username);
        window.location.href = "/";
      });
    } else {
      document.querySelector("#handleLogInBtn").disabled = false;
      Swal.fire({
        icon: "error",
        title: "Jaribio limeshindikana",
        confirmButtonText: "Sawa",
        text: data.error,
        confirmButtonColor: "#d33",
        background: "#1e1e2f",
        color: "#fff",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    // Show error message
  }
}

async function handleRegister() {
  const name = document.getElementById("registerName").value;
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Check if passwords match
  if (password !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Jaribio limeshindikana",
      text: "Nenosiri hazifanani",
      confirmButtonText: "Sawa",
      confirmButtonColor: "#d33",
      background: "#1e1e2f",
      color: "#fff",
    });
    return;
  }

  try {
    const response = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Usajili umefanikiwa",
        text: "Sasa waweza ingia!",
        confirmButtonText: "Sawa",
        confirmButtonColor: "#3085d6",
        background: "#1e1e2f",
        color: "#fff",
      });
      toggleForms();
    } else {
      Swal.fire({
        icon: "error",
        title: "Jaribio limeshindikana",
        confirmButtonText: "Sawa",
        text: data.error,
        confirmButtonColor: "#d33",
        background: "#1e1e2f",
        color: "#fff",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Tatizo",
      text: "Kuna tatizo limetokea, jaribu tena!",
      confirmButtonText: "Sawa",
      confirmButtonColor: "#d33",
      background: "#1e1e2f",
      color: "#fff",
    });
  }
}
