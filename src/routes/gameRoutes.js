const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createGame,
  getGames,
  getAllGames,
  getGameById,
  updateGame,
  deleteGame,
} = require("../controllers/gameController");

router.post("/", auth, createGame);
router.get("/", auth, getGames);
router.get("/all", auth, getAllGames);
router.get("/:id", auth, getGameById);
router.put("/:id", auth, updateGame);
router.delete("/:id", auth, deleteGame);

module.exports = router;
