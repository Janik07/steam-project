const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/game/:appid", async (req, res) => {
  const { appid } = req.params;

  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`;
    const response = await axios.get(url);

    const data = response.data[appid];

    if (!data.success) {
      return res.status(404).json({ message: "Game not found" });
    }

    const game = data.data;

    res.json({
      title: game.name,
      description: game.short_description,
      releaseDate: game.release_date.date,
      coverUrl: game.header_image,
      genres: game.genres?.map(g => g.description),
    });

  } catch (err) {
    res.status(500).json({ message: "Steam API error" });
  }
});

module.exports = router;
