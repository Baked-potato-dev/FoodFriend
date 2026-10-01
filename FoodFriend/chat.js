const CHAT_STORAGE_PREFIX = "foodfriend_chat_history_";
function getCurrentUserId() {
  return localStorage.getItem("foodfriend_user_id");
}

function getChatStorageKey() {
  const userId = getCurrentUserId();
  return userId ? CHAT_STORAGE_PREFIX + userId : null;
}

function saveChatHistory() {
  const messages = document.getElementById("chatMessages");
  const key = getChatStorageKey();
  if (messages && key) {
    localStorage.setItem(key, messages.innerHTML);
  }
}

function loadChatHistory() {
  const messages = document.getElementById("chatMessages");
  const key = getChatStorageKey();
  if (!messages || !key) return;

  const saved = localStorage.getItem(key);
  if (saved) {
    messages.innerHTML = saved;
    messages.scrollTop = messages.scrollHeight;
    restoreMealCardEvents();
  }
}

function resetChat() {
  const messages = document.getElementById("chatMessages");

  if (messages) {
    messages.innerHTML = `
      <div class="message bot-message">
        Need help choosing a meal? Ask me anything! About food, duh.
      </div>
    `;
  }
}

function restoreMealCardEvents() {
  document.querySelectorAll(".chat-meal-card").forEach((card) => {
    const id = card.dataset.mealId;

    if (id) {
      card.onclick = () => {
        window.location.href = `recipes.html?meal=${encodeURIComponent(id)}`;
      };
    }
  });
}

window.toggleChatbot = function () {
  if (!window.requireLogin()) return;
  const popup = document.getElementById("chatPopup");

  if (popup) {
    popup.classList.toggle("active");
  }
};

window.handleChatKeyPress = function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    window.sendChatMessage();
  }
};

window.sendChatMessage = async function () {
  if (!window.requireLogin()) return;
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

  if (!input || !messages) return;
  const userText = input.value.trim();

  if (!userText) return;
  const userMsg = document.createElement("div");
  userMsg.className = "message user-message";
  userMsg.textContent = userText;

  messages.appendChild(userMsg);
  input.value = "";
  messages.scrollTop = messages.scrollHeight;
  saveChatHistory();

  const botMsg = document.createElement("div");
  botMsg.className = "message bot-message";
  botMsg.textContent = "Thinking... Let me check the kitchen! 🧑‍🍳";

  messages.appendChild(botMsg);
  messages.scrollTop = messages.scrollHeight;
  saveChatHistory();

  try {
    const result = await getBotRecommendations(userText);

    if (!result?.meals?.length) {
      botMsg.textContent =
        `Hmm, I couldn't find a meal matching "${userText}". ` +
        `Try mentioning an ingredient or country, like ` +
        `"chicken and rice in India" or "fish from Canada".`;
    } else {
      const ingredientText = result.ingredients.length
        ? result.ingredients.join(" and ")
        : null;

      if (result.area && ingredientText) {
        botMsg.textContent = `Absolutely! I found some ${result.area} dishes using ${ingredientText} for you.`;
      } else if (result.area) {
        botMsg.textContent = `Sure! Here's a random ${result.area} meal for you.`;
      } else if (ingredientText) {
        botMsg.textContent = `Absolutely! Here are some meals using ${ingredientText} for you.`;
      } else {
        botMsg.textContent = "Here are some meals I found for you!";
      }

      result.meals.forEach((meal) => {
        const card = document.createElement("div");

        card.className = "chat-meal-card";
        card.dataset.mealId = meal.idMeal;
        card.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class="chat-meal-info">
            <strong>${meal.strMeal}</strong>
            <span>
              ${meal.strCategory || "Dish"} •
              ${meal.strArea || "Global"}
            </span>
          </div>
        `;

        card.onclick = () => {
          window.location.href = `recipes.html?meal=${encodeURIComponent(
            meal.idMeal
          )}`;
        };
        botMsg.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Chat recommendation error:", error);
    botMsg.textContent =
      "Sorry, I had trouble finding a meal right now. Please try again.";
  }
  messages.scrollTop = messages.scrollHeight;
  saveChatHistory();
};

function normalizeQuery(query) {
  return query
    .toLowerCase()
    .replace(/[?!.,;:'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectIngredients(query) {
  const list = [
    [["chicken", "chickens"], "chicken"],
    [["beef", "steak", "cow"], "beef"],
    [["pork", "bacon", "ham"], "pork"],
    [["lamb"], "lamb"],
    [["fish"], "fish"],
    [["shrimp", "prawn", "prawns"], "shrimp"],
    [["seafood"], "seafood"],
    [["rice"], "rice"],
    [["pasta"], "pasta"],
    [["noodle", "noodles"], "noodles"],
    [["vegetable", "vegetables", "veggie", "veggies"], "vegetable"],
    [["potato", "potatoes"], "potato"],
    [["tomato", "tomatoes"], "tomato"],
    [["egg", "eggs"], "egg"],
    [["cheese"], "cheese"],
    [["bread"], "bread"],
    [["cake", "cakes"], "cake"],
    [["dessert", "desserts"], "dessert"],
    [["soup", "soups"], "soup"],
  ];

  return list
    .filter(([keywords]) =>
      keywords.some((word) => query.toLowerCase().includes(word))
    )
    .map(([, value]) => value);
}

function detectArea(query) {
  const list = [
    [["india", "indian"], "Indian"],
    [["italy", "italian"], "Italian"],
    [["korea", "korean", "south korea"], "Korean"],
    [["japan", "japanese"], "Japanese"],
    [["china", "chinese"], "Chinese"],
    [["thailand", "thai"], "Thai"],
    [["mexico", "mexican"], "Mexican"],
    [["france", "french"], "French"],
    [["spain", "spanish"], "Spanish"],
    [["greece", "greek"], "Greek"],
    [["turkey", "turkish"], "Turkish"],
    [["vietnam", "vietnamese"], "Vietnamese"],
    [["america", "american", "usa", "united states"], "American"],
    [["england", "english", "uk", "british", "united kingdom"], "British"],
    [["morocco", "moroccan"], "Moroccan"],
    [["egypt", "egyptian"], "Egyptian"],
    [["jamaica", "jamaican"], "Jamaican"],
    [["canada", "canadian"], "Canadian"],
    [["ireland", "irish"], "Irish"],
    [["malaysia", "malaysian"], "Malaysian"],
    [["russia", "russian"], "Russian"],
    [["portugal", "portuguese"], "Portuguese"],
    [["croatia", "croatian"], "Croatian"],
    [["philippines", "filipino"], "Filipino"],
    [["poland", "polish"], "Polish"],
    [["netherlands", "dutch"], "Dutch"],
  ];

  const found = list.find(([keywords]) =>
    keywords.some((word) => query.toLowerCase().includes(word))
  );

  return found ? found[1] : null;
}

async function getMealsByIngredient(ingredient) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
        ingredient
      )}`
    );

    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Ingredient search error: ${ingredient}`, error);
    return [];
  }
}

async function getMealsByArea(area) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
        area
      )}`
    );

    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Area search error: ${area}`, error);
    return [];
  }
}

async function getMealDetails(mealId) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
        mealId
      )}`
    );

    const data = await response.json();
    return data.meals?.[0] || null;
  } catch (error) {
    console.error("Meal details error:", error);
    return null;
  }
}

async function getMealsByRandom() {
  try {
    const requests = Array.from({ length: 2 }, () =>
      fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        .then((response) => response.json())
        .then((data) => data.meals?.[0])
    );

    return (await Promise.all(requests)).filter(Boolean);
  } catch (error) {
    console.error("Random meal error:", error);
    return [];
  }
}

function countIngredientMatches(meal, requestedIngredients) {
  if (!meal) return 0;

  const mealIngredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];

    if (ingredient?.trim()) {
      mealIngredients.push(ingredient.toLowerCase().trim());
    }
  }

  return requestedIngredients.reduce((count, requested) => {
    const found = mealIngredients.some(
      (ingredient) =>
        ingredient.includes(requested) || requested.includes(ingredient)
    );

    return count + (found ? 1 : 0);
  }, 0);
}

function scoreMeals(meals, ingredients) {
  return meals
    .filter(Boolean)
    .map((meal) => ({
      meal,
      score: countIngredientMatches(meal, ingredients),
    }))
    .sort((a, b) => b.score - a.score || Math.random() - 0.5)
    .filter((item) => item.score > 0)
    .slice(0, 2)
    .map((item) => item.meal);
}

async function getBotRecommendations(userQuery) {
  const query = normalizeQuery(userQuery);
  const ingredients = detectIngredients(query);
  const area = detectArea(query);

  console.log("User query:", query);
  console.log("Detected ingredients:", ingredients);
  console.log("Detected area:", area);

  if (ingredients.length && area) {
    const mealMap = new Map();

    for (const ingredient of ingredients) {
      const meals = await getMealsByIngredient(ingredient);
      meals.forEach((meal) => {
        mealMap.set(meal.idMeal, meal);
      });
    }

    if (!mealMap.size) return null;

    const detailedMeals = await Promise.all(
      [...mealMap.values()].map((meal) => getMealDetails(meal.idMeal))
    );

    const countryMeals = detailedMeals.filter(
      (meal) =>
        meal?.strArea?.toLowerCase().trim() === area.toLowerCase().trim()
    );

    const meals = scoreMeals(countryMeals, ingredients);
    return meals.length ? { meals, ingredients, area } : null;
  }

  if (area) {
    const meals = await getMealsByArea(area);

    if (!meals.length) return null;
    meals.sort(() => Math.random() - 0.5);

    return {
      meals: meals.slice(0, 2),
      ingredients: [],
      area,
    };
  }

  if (ingredients.length) {
    const mealMap = new Map();
    for (const ingredient of ingredients) {
      const meals = await getMealsByIngredient(ingredient);
      meals.forEach((meal) => {
        mealMap.set(meal.idMeal, meal);
      });
    }
    if (!mealMap.size) return null;
    const detailedMeals = await Promise.all(
      [...mealMap.values()].map((meal) => getMealDetails(meal.idMeal))
    );
    const meals = scoreMeals(detailedMeals, ingredients);
    return meals.length ? { meals, ingredients, area: null } : null;
  }
  const meals = await getMealsByRandom();
  return meals.length ? { meals, ingredients: [], area: null } : null;
}

document.addEventListener("DOMContentLoaded", () => {
  const navigation = performance.getEntriesByType("navigation")[0];
  const isReload = navigation && navigation.type === "reload";
  if (isReload) {
    resetChat();
    return;
  }
  loadChatHistory();
  if (sessionStorage.getItem("foodfriend_restore_chat") === "true") {
    sessionStorage.removeItem("foodfriend_restore_chat");
    loadChatHistory();
  }
});

window.toggleChatSidebar = function () {
  const sidebar = document.getElementById("chatSidebar");
  if (sidebar) {
    sidebar.classList.toggle("collapsed");
  }
};

function startNewChat() {
  saveCurrentConversation();
  activeSavedChatId = null;
  if (typeof resetChat === "function") {
    resetChat();
  } else {
    const messages = document.getElementById("chatMessages");

    if (messages) {
      messages.innerHTML = `
                <div class="message bot-message">
                    Hi twin! What are you in the mood for today?
                </div>
            `;
    }
  }

  const input = document.getElementById("chatInput");
  if (input) {
    input.value = "";
  }
  renderChatHistory();
  const sidebar = document.getElementById("chatSidebar");
  if (sidebar && !sidebar.classList.contains("collapsed")) {
    sidebar.classList.add("collapsed");
  }
}
let activeSavedChatId = null;
function getChatHistoryKey() {
  const userId = localStorage.getItem("foodfriend_user_id");
  if (!userId) return null;
  return `foodfriend_saved_chats_${userId}`;
}

function getSavedChats() {
  const key = getChatHistoryKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    console.error("Could not load saved chats:", error);
    return [];
  }
}

function storeSavedChats(chats) {
  const key = getChatHistoryKey();

  if (!key) return;

  localStorage.setItem(key, JSON.stringify(chats));
}

function getChatTitle(messagesHTML) {
  const temp = document.createElement("div");
  temp.innerHTML = messagesHTML;

  const firstUserMessage = temp.querySelector(".user-message");

  if (!firstUserMessage) return "New Chat";

  const title = firstUserMessage.textContent.trim();

  return title.length > 35 ? title.substring(0, 35) + "..." : title;
}

function saveCurrentConversation() {
  const messages = document.getElementById("chatMessages");

  if (!messages) return;

  const messagesHTML = messages.innerHTML;
  const temp = document.createElement("div");
  temp.innerHTML = messagesHTML;

  if (!temp.querySelector(".user-message")) return;

  const chats = getSavedChats();
  const now = new Date().toISOString();

  let existingChat = chats.find((chat) => chat.id === activeSavedChatId);

  if (existingChat) {
    existingChat.messages = messagesHTML;
    existingChat.title = getChatTitle(messagesHTML);
    existingChat.updatedAt = now;
  } else {
    const newChat = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title: getChatTitle(messagesHTML),
      messages: messagesHTML,
      createdAt: now,
      updatedAt: now,
    };

    chats.unshift(newChat);
    activeSavedChatId = newChat.id;
  }

  storeSavedChats(chats);
  renderChatHistory();
}

function renderChatHistory() {
  const historyList = document.getElementById("chatHistoryList");
  if (!historyList) return;
  historyList.innerHTML = `
        <p class="history-label">Recent chats</p>
    `;

  const chats = getSavedChats();
  chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  chats.forEach((chat) => {
    const item = document.createElement("button");
    item.className = "history-item";
    item.textContent = chat.title;
    item.type = "button";
    if (chat.id === activeSavedChatId) {
      item.classList.add("active");
    }
    item.addEventListener("click", () => {
      openSavedChat(chat.id);
    });
    historyList.appendChild(item);
  });
}

function openSavedChat(chatId) {
  saveCurrentConversation();

  const chats = getSavedChats();
  const selectedChat = chats.find((chat) => chat.id === chatId);
  if (!selectedChat) return;

  const messages = document.getElementById("chatMessages");
  messages.innerHTML = selectedChat.messages;
  activeSavedChatId = selectedChat.id;
  if (typeof restoreMealCardEvents === "function") {
    restoreMealCardEvents();
  }
  messages.scrollTop = messages.scrollHeight;
  renderChatHistory();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderChatHistory);
} else {
  renderChatHistory();
}
