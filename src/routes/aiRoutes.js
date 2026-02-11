const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Game = require("../models/Game");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ключевые слова для локального анализа
const keywordMap = {
  RPG: ["рпг", "rpg", "сюжет", "фэнтези", "fantasy", "квест", "диалоги", "open world"],
  Shooter: ["шутер", "shooter", "fps", "стрель", "gun", "cs", "call of duty", "быстрый"],
  Strategy: ["стратег", "strategy", "rts", "тактик", "база", "economy", "civilization", "цив"],
  MOBA: ["moba", "дота", "dota", "league", "лига", "lane"],
  Sports: ["спорт", "football", "fifa", "nba", "гонки", "racing"],
  Simulation: ["симуляц", "sim", "ферма", "stardew", "строить", "builder", "manager"],
  Horror: ["хоррор", "ужас", "страш", "horror"],
  Adventure: ["приключ", "adventure", "исслед", "quest"],
  Action: ["экшен", "action", "слэшер", "slasher", "боевик"],
};

function pickGenreLocal(preferencesText, genres) {
  const text = (preferencesText || "").toLowerCase();
  let bestGenre = genres[0];
  let bestScore = -1;

  genres.forEach((g) => {
    const keys = keywordMap[g] || [];
    const score = keys.reduce(
      (acc, kw) => (text.includes(kw) ? acc + 1 : acc),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestGenre = g;
    }
  });

  return {
    genre: bestGenre || genres[0] || "Action",
    reason: bestScore > 0 ? "По локальным ключевым словам" : "Ближайший жанр по умолчанию",
  };
}

router.post("/recommend", async (req, res) => {
  const { preferences, choices } = req.body || {};

  if (!preferences || (typeof preferences === "string" && !preferences.trim())) {
    return res.status(400).json({ message: "Preferences required" });
  }

  // жанры из базы
  const genresFromDb = await Game.distinct("genre");
  const genresClean = (genresFromDb || [])
    .filter(Boolean)
    .map((g) => g.trim())
    .filter(Boolean);
  const genres =
    genresClean.length > 0
      ? genresClean
      : ["Action", "Adventure", "RPG", "Shooter", "Strategy", "Simulation", "Horror", "MOBA"];

  // 1) локальный подбор
  let parsed = pickGenreLocal(preferences, genres);
  let aiMode = "local";

  // 2) OpenAI — попытка улучшить, если ключ задан
  if (process.env.OPENAI_API_KEY) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `Ты помогаешь подобрать игру. Есть ответы пользователя и жанры: ${genres.join(
              ", "
            )}. Верни строго JSON:
{ "genre": "ЖАНР", "reason": "кратко почему" }`,
          },
          {
            role: "user",
            content: JSON.stringify({
              free_text: preferences,
              choices: choices || {},
            }),
          },
        ],
      });

      const raw = completion.choices?.[0]?.message?.content || "{}";
      parsed = JSON.parse(raw);
      aiMode = "gpt";
    } catch (err) {
      console.error("OpenAI failed, staying on local:", err?.response?.data || err.message);
    }
  }

  if (!parsed || !parsed.genre) {
    parsed = pickGenreLocal(preferences, genres);
    aiMode = "local";
  }

  try {
    const recommendedGames = await Game.find({
      genre: parsed.genre,
    })
      .limit(10)
      .lean();

    res.json({
      aiMode,
      detectedGenre: parsed.genre,
      reason: parsed.reason,
      games: recommendedGames,
    });
  } catch (err) {
    console.error("AI error:", err?.response?.data || err.message);
    const fallbackGames = await Game.find({}).limit(5).lean();
    res.status(502).json({
      message: "AI recommendation error",
      detail: err?.response?.data || err.message,
      games: fallbackGames,
    });
  }
});

module.exports = router;
