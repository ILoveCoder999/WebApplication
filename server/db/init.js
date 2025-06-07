// File: server/db/init.js

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'stuff.db');
const firstRun = !fs.existsSync(dbPath);

export const db = new Database(dbPath);

// If this is the first time we run, create tables and seed data
if (firstRun) {
  console.log('⏳ Seeding SQLite database…');

  // 1) Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      imgUrl TEXT NOT NULL,
      badLuckIdx REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT,
      status TEXT NOT NULL DEFAULT 'ongoing',
      wrongCount INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER NOT NULL,
      cardId INTEGER NOT NULL,
      orderNo INTEGER NOT NULL,
      guessedCorrect INTEGER NOT NULL,
      FOREIGN KEY(gameId) REFERENCES games(id),
      FOREIGN KEY(cardId) REFERENCES cards(id)
    );
  `);

  // 2) Seed one demo user
  const ustmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  ustmt.run('demo', 'demo');

  // 3) Seed the 50 “Travel & Tourism” cards
  // Option A: Read from a separate SQL file (seed_cards.sql)
  // ----------------------------------------------------------------------------------
  // Make sure you have created a file at server/db/seed_cards.sql containing exactly the
  // 50 INSERT statements we showed previously. Then this block will execute them:
  // ----------------------------------------------------------------------------------
  try {
    const seedSqlPath = join(__dirname, 'seed_cards.sql');
    if (fs.existsSync(seedSqlPath)) {
      const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
      db.exec(seedSql);
    } else {
      throw new Error('seed_cards.sql not found');
    }
  } catch (err) {
    console.error('Failed to read seed_cards.sql:', err);
    // Option B: If you prefer to inline the 50 INSERT statements instead of reading from a file,
    // you can comment out the above try/catch block and uncomment the “INLINE SQL” block below:
    // ----------------------------------------------------------------------------------
    /*
    db.exec(`
      INSERT INTO cards (title, imgUrl, badLuckIdx) VALUES
        ('Missed boarding announcement at the airport, plane has already departed', 
         'https://picsum.photos/seed/miss_gate/200/300', 
         10.0),
        ('Luggage lost at the airport, containing all your change of clothes', 
         'https://picsum.photos/seed/lost_luggage/200/300', 
         20.0),
        ('Forgot passport at hotel, stopped by customs during departure', 
         'https://picsum.photos/seed/no_passport/200/300', 
         30.0),
        ('Booked hotel shows full due to system error, forced to stay in neighboring city', 
         'https://picsum.photos/seed/hotel_full/200/300', 
         25.5),
        ('Taxi driver at midnight takes you to a remote area with no cell signal', 
         'https://picsum.photos/seed/bad_taxi/200/300', 
         18.5),
        ('Wallet stolen from your bag by a thief while taking photos at a tourist spot', 
         'https://picsum.photos/seed/wallet_stolen/200/300', 
         40.0),
        ('Rental car breaks down in the wilderness with no phone signal', 
         'https://picsum.photos/seed/car_breakdown/200/300', 
         35.0),
        ('Missed the only bus, forced to walk back to the hotel', 
         'https://picsum.photos/seed/missed_bus/200/300', 
         15.5),
        ('Got food poisoning on a cruise, suffer diarrhea for several days', 
         'https://picsum.photos/seed/food_poisoning/200/300', 
         22.0),
        ('Life jacket blown away by wind on the boat, almost fell into the water', 
         'https://picsum.photos/seed/lost_lifejacket/200/300', 
         28.0),
        ('Accidentally threw boarding pass into the trash, spent 30 minutes searching at airport security', 
         'https://picsum.photos/seed/boarding_pass_gone/200/300', 
         12.5),
        ('Booked Airbnb with terrible hygiene, house full of cockroaches', 
         'https://picsum.photos/seed/dirty_airbnb/200/300', 
         26.0),
        ('Locked out by hotel reception error at dawn, main gate locked', 
         'https://picsum.photos/seed/locked_out/200/300', 
         16.0),
        ('Severe sunburn on the beach, skin peeling for a week', 
         'https://picsum.photos/seed/sunburn/200/300', 
         14.0),
        ('Scuba gear malfunction while diving, nearly drowned', 
         'https://picsum.photos/seed/scuba_trouble/200/300', 
         38.0),
        ('Ankle sprained while trekking in the rainforest, had to be carried out on a stretcher', 
         'https://picsum.photos/seed/sprained_ankle/200/300', 
         33.5),
        ('Contagious gastroenteritis outbreak on the ship, all passengers quarantined', 
         'https://picsum.photos/seed/ship_illness/200/300', 
         45.0),
        ('Rope snapped during rock climbing, fell from halfway up the mountain', 
         'https://picsum.photos/seed/rock_climbing_fall/200/300', 
         50.0),
        ('Lost direction while self-driving in the desert, ran out of water and fuel', 
         'https://picsum.photos/seed/desert_stranded/200/300', 
         60.0),
        ('Caught in a blizzard at the summit, trapped on a 5000m peak', 
         'https://picsum.photos/seed/snowstorm/200/300', 
         75.0),
        ('Hot air balloon loses control, lands in a dangerous canyon', 
         'https://picsum.photos/seed/balloon_crash/200/300', 
         70.0),
        ('Intentional peak season price hike, originally cheap flight becomes extremely expensive', 
         'https://picsum.photos/seed/flight_price_hike/200/300', 
         19.0),
        ('Scammed by a local “tour guide” into an expensive attraction, left penniless', 
         'https://picsum.photos/seed/scam_tour/200/300', 
         27.5),
        ('Attacked and bitten by lions at a wildlife park', 
         'https://picsum.photos/seed/lion_attack/200/300', 
         80.0),
        ('Trapped in an elevator for hours during a power outage, phone also dead', 
         'https://picsum.photos/seed/stuck_elevator/200/300', 
         23.0),
        ('Visa on arrival policy suddenly changed, detained for three days', 
         'https://picsum.photos/seed/visa_change/200/300', 
         55.0),
        ('Frostbite on the soles during a glacier trek, required toe amputation surgery', 
         'https://picsum.photos/seed/frostbite/200/300', 
         65.0),
        ('Lost while mountain climbing, no phone navigation signal', 
         'https://picsum.photos/seed/lost_hiker/200/300', 
         35.5),
        ('Bitten by insects in the rainforest, contracted malaria', 
         'https://picsum.photos/seed/malaria/200/300', 
         58.0),
        ('Yacht engine failure on a night voyage, drifted into open sea', 
         'https://picsum.photos/seed/boat_engine_fail/200/300', 
         42.5),
        ('Snow blindness during a polar expedition, blind for two hours', 
         'https://picsum.photos/seed/snow_blind/200/300', 
         48.0),
        ('Missed the last train, forced to spend the night at the station', 
         'https://picsum.photos/seed/missed_train/200/300', 
         13.5),
        ('Food poisoning from a roadside restaurant, hospitalized for three days', 
         'https://picsum.photos/seed/restaurant_food_poison/200/300', 
         31.0),
        ('Stung by jellyfish while swimming at the beach, severe allergic reaction', 
         'https://picsum.photos/seed/jellyfish_sting/200/300', 
         29.5),
        ('Phone stolen while exploring the city, lost all navigation', 
         'https://picsum.photos/seed/phone_stolen/200/300', 
         24.0),
        ('Mistakenly took someone else\'s expensive suitcase, can\'t retrieve your own', 
         'https://picsum.photos/seed/wrong_luggage/200/300', 
         17.0),
        ('Hotel reception in a mountain area overcharged double the room rate by mistake', 
         'https://picsum.photos/seed/overcharged/200/300', 
         11.5),
        ('Hotel room flooded by a burst pipe, belongings soaked', 
         'https://picsum.photos/seed/flooded_room/200/300', 
         21.0),
        ('Encountered severe turbulence on flight, all passengers vomited', 
         'https://picsum.photos/seed/turbulence/200/300', 
         32.5),
        ('Mistaken for a terrorist while queuing at the airport, subjected to prolonged security interrogation', 
         'https://picsum.photos/seed/airport_misunderstand/200/300', 
         36.0),
        ('Caught in an avalanche while skiing, rescue in valley extremely costly', 
         'https://picsum.photos/seed/avalanche/200/300', 
         68.0),
        ('Hit by lightning while riding a hot air balloon, nearly killed', 
         'https://picsum.photos/seed/balloon_lightning/200/300', 
         85.0),
        ('Fuel tank leak causing engine fire during desert off-roading', 
         'https://picsum.photos/seed/desert_fire/200/300', 
         72.5),
        ('Boat capsized during an extreme water sport, drowned for three minutes', 
         'https://picsum.photos/seed/raft_capsize/200/300', 
         77.0),
        ('Frostbite caused by sudden mountain weather change, lost both toes', 
         'https://picsum.photos/seed/frostbite_toes/200/300', 
         88.0),
        ('Oxygen tank leaked during deep-sea diving, nearly suffocated', 
         'https://picsum.photos/seed/deep_dive_leak/200/300', 
         90.0),
        ('Private plane crash, miraculously survived', 
         'https://picsum.photos/seed/plane_crash_survive/200/300', 
         95.0),
        ('Lost in snowy mountain skiing for days, nearly froze to death', 
         'https://picsum.photos/seed/snowstorm_lost/200/300', 
         92.5),
        ('Attacked by a shark at sea, right arm bitten off', 
         'https://picsum.photos/seed/shark_attack/200/300', 
         100.0),
        ('Buried under collapsed ruins during exploration for 24 hours', 
         'https://picsum.photos/seed/ruins_collapse/200/300', 
         98.0);
    `);
    */
  }

  console.log('✅ Seed done');
}
