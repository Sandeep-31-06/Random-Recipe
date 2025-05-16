import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

window.signupUser = async function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    alert('Signup successful!');
    localStorage.setItem("userEmail", userCred.user.email);
    window.location.href = "/dashboard.html";
  } catch (error) {
    alert("Signup error: " + error.message);
  }
};


window.loginUser = async function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    alert('Login successful!');
    localStorage.setItem("userEmail", userCred.user.email);
    window.location.href = "/dashboard.html";
  } catch (error) {
    alert("Login error: " + error.message);
  }
};


window.logoutUser = function () {
  localStorage.removeItem("userEmail");
  window.location.href = "/index.html";
};


window.getRecipe = async function () {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const data = await res.json();
  const recipe = data.meals[0];

  window.currentRecipe = {
    id: recipe.idMeal,
    title: recipe.strMeal,
    image: recipe.strMealThumb,
    instructions: recipe.strInstructions
  };

  document.getElementById("recipe").innerHTML = `
    <div class="recipe-card">
      <h4>${recipe.strMeal}</h4>
      <img src="${recipe.strMealThumb}" />
      <p>${recipe.strInstructions.slice(0, 300)}...</p>
    </div>
  `;
};


window.saveFavorite = async function () {
  const email = localStorage.getItem("userEmail");
  const recipe = window.currentRecipe;

  if (!email) {
    alert("⚠️ Please log in first.");
    return;
  }

  if (!recipe) {
    alert("⚠️ Please click 'Get Random Recipe' before saving.");
    return;
  }

  const { id, title, image, instructions } = recipe;

  try {
    const response = await fetch("/save-favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, image, instructions, email })
    });

    const message = await response.text();

    if (!response.ok) {
      throw new Error(message);
    }

    alert("✅ Recipe saved!");
    addFavoriteToDOM(recipe);
  } catch (err) {
    alert("❌ Error saving favorite: " + err.message);
    console.error("Error saving favorite:", err);
  }
};

window.loadFavorites = async function () {
  const email = localStorage.getItem("userEmail");
  if (!email) return;

  try {
    const res = await fetch(`/favorites?email=${encodeURIComponent(email)}`);
    const favorites = await res.json();

    const favs = document.getElementById("favorites");
    favs.innerHTML = favorites.length === 0
      ? "<p>No favorites yet.</p>"
      : favorites.map(fav => `
        <div class="recipe-card" id="fav-${fav.id}">
          <h4>${fav.title}</h4>
          <img src="${fav.image}" />
          <p>${(fav.instructions || "").slice(0, 200)}...</p>
          <button onclick="removeFavorite('${fav.id}')">🗑 Remove</button>
        </div>
      `).join("");
  } catch (error) {
    console.error("❌ Error loading favorites:", error.message);
  }
};



wwindow.removeFavorite = async function (id) {
  const email = localStorage.getItem("userEmail");
  if (!email) {
    alert("Not logged in");
    return;
  }

  try {
    const res = await fetch("/remove-favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email })
    });

    const msg = await res.text();
    alert(msg);

    if (res.ok) {
      const card = document.getElementById(`fav-${id}`);
      if (card) card.remove();
    }
  } catch (err) {
    alert("❌ Failed to remove favorite: " + err.message);
  }
};

function addFavoriteToDOM(recipe) {
  const favContainer = document.getElementById("favorites");

  const card = document.createElement("div");
  card.classList.add("recipe-card");

  card.innerHTML = `
    <h4>${recipe.title}</h4>
    <img src="${recipe.image}" alt="${recipe.title}" />
    <p>${(recipe.instructions || "").slice(0, 200)}...</p>
  `;

  favContainer.appendChild(card);
}

if (window.location.pathname.includes("dashboard.html")) {
  window.addEventListener("DOMContentLoaded", loadFavorites);
}
