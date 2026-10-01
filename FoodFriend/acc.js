import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0t3809nuKgWvMUukkukdcl9Oc-AAtkuc",
  authDomain: "foodfriend-6fcaa.firebaseapp.com",
  projectId: "foodfriend-6fcaa",
  storageBucket: "foodfriend-6fcaa.firebasestorage.app",
  messagingSenderId: "519855135220",
  appId: "1:519855135220:web:1876320b8107b6501581a1",
  measurementId: "G-D3NBNHT3YR",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      localStorage.setItem("foodfriend_logged_in", "true");
      localStorage.setItem("foodfriend_user_id", user.uid);

      sessionStorage.setItem("foodfriend_restore_chat", "true");

      window.location.href = "account.html";
    } catch (error) {
      alert("Registration Error: " + error.code);
    }
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      localStorage.setItem("foodfriend_logged_in", "true");
      localStorage.setItem("foodfriend_user_id", user.uid);

      sessionStorage.setItem("foodfriend_restore_chat", "true");

      window.location.href = "index.html";
    } catch (error) {
      localStorage.removeItem("foodfriend_logged_in");
      localStorage.removeItem("foodfriend_user_id");

      alert("Login Error: " + error.code);
    }
  });
}

window.logoutUser = async function () {
  try {
    await signOut(auth);

    localStorage.removeItem("foodfriend_logged_in");
    localStorage.removeItem("foodfriend_user_id");

    const messagesContainer = document.getElementById("chatMessages");

    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="message bot-message">
          Need help choosing a meal? Ask me anything! About food, duh.
        </div>
      `;
    }

    window.location.href = "account.html";
  } catch (error) {
    alert("Logout Error: " + error.message);
  }
};
window.togglePassword = function (inputId, btn) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
};

function updateAccountInfo(user) {
  const accountName = document.getElementById("accountName");
  const accountJoined = document.getElementById("accountJoined");

  if (!accountName || !accountJoined) return;

  if (user) {
    accountName.textContent = user.email;

    const joinedDate = new Date(user.metadata.creationTime);

    accountJoined.textContent =
      "Joined: " +
      joinedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
  } else {
    accountName.textContent = "Not logged in";
    accountJoined.textContent = "Please log in";
  }
}

auth.onAuthStateChanged((user) => {
  updateAccountInfo(user);
});
