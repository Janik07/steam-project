const API = "/api";
const token = localStorage.getItem("token");
const placeholderCover =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60";

const isGamesPage = location.pathname.includes("games");

const prefs = {
  pace: "",
  company: "",
  price: "",
  vibe: "",
  difficulty: "",
};

function ensureAuthOnGames() {
  if (!token && isGamesPage) {
    window.location.href = "index.html";
  }
}

ensureAuthOnGames();

function starsTemplate(rating, gameId, editable) {
  const max = 5;
  let html = '<div class="stars">';
  for (let i = 1; i <= max; i++) {
    const filled = i <= Math.round(rating || 0);
    const handler =
      editable && gameId ? `onclick="rateGame('${gameId}', ${i})"` : "";
    html += `<button class="star ${filled ? "filled" : ""}" ${handler}>★</button>`;
  }
  html += "</div>";
  return html;
}

function cardTemplate(game, canEdit = false) {
  const priceValue = Number(game.price);
  const priceLabel = Number.isFinite(priceValue)
    ? `$${priceValue.toFixed(2)}`
    : game.price || "Free";
  const cover =
    game.cover ||
    game.iconUrl ||
    game.coverImage ||
    game.header_image ||
    placeholderCover;
  const release = game.releaseDate
    ? new Date(game.releaseDate).toLocaleDateString()
    : "TBA";

  const ratingBlock = `<div class="rating">Оценка: ${starsTemplate(
    game.rating || 0,
    game._id,
    canEdit
  )}</div>`;

  return `
    <article class="game-card">
      <div class="game-cover" style="background-image:url('${cover}');"></div>
      <div class="game-info">
        <div class="game-meta">
          <span class="tag">${game.genre || "Жанр"}</span>
          <span class="tag price">${priceLabel}</span>
        </div>
        <h3>${game.title || "Игра"}</h3>
        <p class="muted">Релиз: ${release}</p>
        ${ratingBlock}
      </div>
      ${
        canEdit && game._id
          ? `<button class="ghost danger" onclick="deleteGame('${game._id}')">Удалить</button>`
          : ""
      }
    </article>
  `;
}

async function loadGames() {
  if (!isGamesPage) return;

  const res = await fetch(`${API}/games`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    logout();
    return;
  }

  const games = await res.json();
  const list = document.getElementById("gamesList");
  if (!list) return;

  list.innerHTML = games.map((g) => cardTemplate(g, true)).join("");

  const total = document.getElementById("totalGames");
  if (total) total.textContent = Array.isArray(games) ? games.length : 0;
}

async function loadAllGames() {
  if (!isGamesPage) return;
  const list = document.getElementById("allGamesList");
  if (!list) return;

  const res = await fetch(`${API}/games/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    list.innerHTML = `<p class="muted">Не удалось загрузить каталог.</p>`;
    return;
  }

  const games = await res.json();
  list.innerHTML = games.map((g) => cardTemplate(g, false)).join("");
}

async function addGame() {
  const game = {
    title: title.value,
    genre: genre.value,
    price: price.value,
    releaseDate: releaseDate.value,
    cover: cover.value,
    iconUrl: cover.value,
    rating: 0,
  };

  await fetch(`${API}/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(game),
  });

  title.value = "";
  genre.value = "";
  price.value = "";
  releaseDate.value = "";
  cover.value = "";

  loadGames();
}

async function deleteGame(id) {
  await fetch(`${API}/games/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  loadGames();
}

async function rateGame(id, value) {
  await fetch(`${API}/games/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating: value }),
  });
  loadGames();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function bindChoiceButtons() {
  const buttons = document.querySelectorAll(".choice");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.choice;
      const value = btn.dataset.value;
      prefs[field] = value;

      document
        .querySelectorAll(`[data-choice='${field}']`)
        .forEach((el) => el.classList.remove("active"));

      btn.classList.add("active");
    });
  });
}

function buildPreferencesPayload() {
  const notes = document.getElementById("prefNotes")?.value || "";
  return {
    text: `Темп: ${prefs.pace || "любой"}; Формат: ${
      prefs.company || "любой"
    }; Бюджет: ${prefs.price || "любой"}; Настроение: ${
      prefs.vibe || "любое"
    }; Сложность: ${prefs.difficulty || "любая"}. Дополнительно: ${notes}`,
    choices: { ...prefs },
  };
}

async function runQuiz() {
  const status = document.getElementById("aiStatus");
  const btn = document.getElementById("runQuizBtn");
  const genreEl = document.getElementById("detectedGenre");
  const reasonEl = document.getElementById("genreReason");
  const resultsEl = document.getElementById("aiResults");

  if (!btn) return;

  btn.disabled = true;
  if (status) status.textContent = "Думаю...";

  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const payload = buildPreferencesPayload();

    const res = await fetch(`${API}/ai/recommend`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        preferences: payload.text,
        choices: payload.choices,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.detail || "Ошибка подбора");

    if (genreEl) genreEl.textContent = data.detectedGenre || "—";
    if (reasonEl) reasonEl.textContent = data.reason || "";
    if (resultsEl) {
      resultsEl.innerHTML =
        data.games?.length > 0
          ? data.games.map((g) => cardTemplate({ ...g, _id: null })).join("")
          : `<p class="muted">Похожих игр не найдено.</p>`;
    }
    if (status) status.textContent = `Режим: ${data.aiMode === "gpt" ? "OpenAI" : "локальный"}`;
  } catch (err) {
    if (status) status.textContent = err.message;
    const resultsEl = document.getElementById("aiResults");
    if (resultsEl) {
      resultsEl.innerHTML = `<p class="muted">Пока не удалось получить ответ ИИ. Проверь API-ключ. ${err.message}</p>`;
    }
  } finally {
    btn.disabled = false;
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "games.html";
    } else {
      message.textContent = data.message || "Ошибка входа";
      message.style.color = "#ff9a9a";
    }
  } catch (err) {
    message.textContent = "Ошибка сервера";
    message.style.color = "#ff9a9a";
  }
}

async function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      message.textContent = "Готово! Теперь можно войти.";
      message.style.color = "#66e0ff";
      setTimeout(() => (window.location.href = "index.html"), 900);
    } else {
      message.textContent = data.message || "Не удалось зарегистрироваться";
      message.style.color = "#ff9a9a";
    }
  } catch (err) {
    message.textContent = "Ошибка сервера";
    message.style.color = "#ff9a9a";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (isGamesPage) {
    bindChoiceButtons();
    loadGames();
    loadAllGames();
  }
});
