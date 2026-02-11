const Game = require("../models/Game");

// CREATE
exports.createGame = async (req, res) => {
  try {
    const game = await Game.create({
      ...req.body,
      owner: req.user.id,
      rating: req.body.rating || 0,
    });
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET ALL (только свои)
exports.getGames = async (req, res) => {
  const games = await Game.find({ owner: req.user.id });
  res.json(games);
};

// GET ALL (все из базы)
exports.getAllGames = async (_req, res) => {
  const games = await Game.find({});
  res.json(games);
};

// GET ONE
exports.getGameById = async (req, res) => {
  const game = await Game.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  res.json(game);
};

// UPDATE
exports.updateGame = async (req, res) => {
  const game = await Game.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true }
  );

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  res.json(game);
};

// DELETE
exports.deleteGame = async (req, res) => {
  const game = await Game.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  res.json({ message: "Game deleted" });
};
