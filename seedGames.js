require("dotenv").config();
const mongoose = require("./.gitignore/node_modules/mongoose");
const Game = require("./src/models/Game");

const USER_ID = "698991fa1a41164915e2bf28";

mongoose.connect(process.env.MONGO_URI);

const games = [
  {
  title: "Cyberpunk 2077",
  genre: "RPG",
  type: "Singleplayer",
  price: 60,
  iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
  owner: USER_ID,
  },

  {
    title: "The Witcher 3",
    genre: "RPG",
    type: "Singleplayer",
    price: 40,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
    owner: USER_ID,
  },
  {
    title: "Doom Eternal",
    genre: "Shooter",
    type: "Singleplayer",
    price: 30,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg",
    owner: USER_ID,
  },
  {
    title: "Counter-Strike 2",
    genre: "Shooter",
    type: "Multiplayer",
    price: 0,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    owner: USER_ID,
  },
  {
    title: "Dota 2",
    genre: "MOBA",
    type: "Multiplayer",
    price: 0,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
    owner: USER_ID,
  },
  {
    title: "Elden Ring",
    genre: "RPG",
    type: "Singleplayer",
    price: 60,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    owner: USER_ID,
  },
  {
    title: "Stardew Valley",
    genre: "Simulation",
    type: "Singleplayer",
    price: 15,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
    owner: USER_ID,
  },
  {
    title: "FIFA 23",
    genre: "Sports",
    type: "Multiplayer",
    price: 20,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1811260/header.jpg",
    owner: USER_ID,
  },
  {
    title: "Hades",
    genre: "Action",
    type: "Singleplayer",
    price: 20,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg",
    owner: USER_ID,
  },
  {
    title: "Among Us",
    genre: "Party",
    type: "Multiplayer",
    price: 10,
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg",
    owner: USER_ID,
  },

  
];

async function seed() {
  try {
    await Game.deleteMany({ owner: USER_ID });
    await Game.insertMany(games);
    console.log("✅ Games successfully seeded");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
