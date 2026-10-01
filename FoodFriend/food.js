window.searchMealAPI = async function (val) {
  const suggestionsBox = document.getElementById("recipeSuggestions");

  if (!suggestionsBox) return;

  if (val.trim().length === 0) {
    suggestionsBox.classList.add("hidden");
    suggestionsBox.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        val
      )}`
    );

    const data = await response.json();

    if (data.meals) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.remove("hidden");

      data.meals.slice(0, 5).forEach((meal) => {
        const item = document.createElement("div");

        item.className = "suggestion-item";

        item.innerHTML = `
          <img
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"
            class="suggestion-thumb"
          />

          <div class="suggestion-info">
            <span class="suggestion-title">
              ${meal.strMeal}
            </span>

            <span class="suggestion-meta">
              ${meal.strCategory} • ${meal.strArea}
            </span>
          </div>
        `;

        item.onclick = () => {
          suggestionsBox.classList.add("hidden");

          const input = document.getElementById("recipeSearchInput");

          if (input) {
            input.value = meal.strMeal;
          }
        };

        suggestionsBox.appendChild(item);
      });
    } else {
      suggestionsBox.innerHTML =
        "<div class='suggestion-empty'>No matching recipes found</div>";

      suggestionsBox.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error searching meals:", error);
  }
};

window.getRandomMeal = async function () {
  if (!window.requireLogin()) {
    return;
  }

  const randomChars = ["a", "b", "c", "d", "e", "f", "g", "m", "p", "s", "t"];

  const randomVal = randomChars[Math.floor(Math.random() * randomChars.length)];

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${randomVal}`
    );

    const data = await response.json();

    if (data.meals && data.meals.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.meals.length);

      const selectedMeal = data.meals[randomIndex];

      window.renderMealCard(selectedMeal, true);
    }
  } catch (error) {
    console.error("Error fetching random meal:", error);
  }
};

window.renderMealCard = function (meal, showResult = false) {
  const resultContainer = document.getElementById("recipeResult");

  if (!resultContainer) return;

  const mealImage = document.getElementById("mealImage");
  const mealTitle = document.getElementById("mealTitle");
  const mealCategory = document.getElementById("mealCategory");
  const mealOrigin = document.getElementById("mealOrigin");
  const mealInstructions = document.getElementById("mealInstructions");
  const mealVideoWrapper = document.getElementById("mealVideoWrapper");
  const mealVideoLink = document.getElementById("mealVideoLink");

  if (mealImage) {
    mealImage.src = meal.strMealThumb;
  }

  if (mealTitle) {
    mealTitle.textContent = meal.strMeal;
  }

  if (mealCategory) {
    mealCategory.textContent = meal.strCategory || "Dish";
  }

  if (mealOrigin) {
    mealOrigin.textContent = `📍 ${meal.strArea || "Global"}`;
  }

  if (mealInstructions) {
    mealInstructions.textContent =
      meal.strInstructions || "No instructions available.";
  }

  if (mealVideoWrapper && mealVideoLink) {
    if (meal.strYoutube) {
      mealVideoLink.href = meal.strYoutube;
      mealVideoWrapper.classList.remove("hidden");
    } else {
      mealVideoWrapper.classList.add("hidden");
    }
  }

  if (showResult) {
    resultContainer.classList.remove("hidden");

    resultContainer.scrollIntoView({
      behavior: "smooth",
    });
  }
};

async function loadMealFromURL() {
  const params = new URLSearchParams(window.location.search);
  const mealId = params.get("meal");

  if (!mealId) {
    return;
  }

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
        mealId
      )}`
    );

    const data = await response.json();

    if (data.meals && data.meals.length > 0) {
      const meal = data.meals[0];

      renderMealCard(meal, true);
    }
  } catch (error) {
    console.error("Error loading selected meal:", error);
  }
}

async function loadMealFromURL() {
  const params = new URLSearchParams(window.location.search);

  const mealId = params.get("meal");

  if (!mealId) {
    return;
  }

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
        mealId
      )}`
    );

    const data = await response.json();
    if (data.meals && data.meals.length > 0) {
      const meal = data.meals[0];
      window.renderMealCard(meal, true);
    }
  } catch (error) {
    console.error("Error loading selected meal:", error);
  }
}
