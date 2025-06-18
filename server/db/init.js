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
   '../client/src/assets/images/1missed-fight.png', 
   10.0),
  ('Luggage lost at the airport, containing all your change of clothes', 
   '../client/src/assets/images/2lost-luggage.png', 
   20.0),
  ('Forgot passport at hotel, stopped by customs during departure', 
   '../client/src/assets/images/3passport-issue.png', 
   30.0),
  ('Booked hotel shows full due to system error, forced to stay in neighboring city', 
   '../client/src/assets/images/4hotel-full.png', 
   25.5),
  ('Taxi driver at midnight takes you to a remote area with no cell signal', 
   '../client/src/assets/images/5taxi-trouble.png', 
   18.5),
  ('Wallet stolen from your bag by a thief while taking photos at a tourist spot', 
   '../client/src/assets/images/6phone-stolen.png', 
   40.0),
  ('Rental car breaks down in the wilderness with no phone signal', 
   '../client/src/assets/images/7car-breakdown.png', 
   35.0),
  ('Missed the only bus, forced to walk back to the hotel', 
   '../client/src/assets/images/8missed-bus.png', 
   15.5),
  ('Got food poisoning on a cruise, suffer diarrhea for several days', 
   '../client/src/assets/images/9cruise-stomach.png', 
   22.0),
  ('Life jacket blown away by wind on the boat, almost fell into the water', 
   '../client/src/assets/images/10fallinto-water.png', 
   28.0),
  ('Accidentally threw boarding pass into the trash, spent 30 minutes searching at airport security', 
   '../client/src/assets/images/11travel-longqueue.png', 
   12.5),
  ('Booked Airbnb with terrible hygiene, house full of cockroaches', 
   '../client/src/assets/images/12room-cockroaches.png', 
   26.0),
  ('Locked out by hotel reception error at dawn, main gate locked', 
   '../client/src/assets/images/13lockedout-hotel.png', 
   16.0),
  ('Severe sunburn on the beach, skin peeling for a week', 
   '../client/src/assets/images/14sunburn.png', 
   14.0),
  ('Scuba gear malfunction while diving, nearly drowned', 
   '../client/src/assets/images/15scuba-trouble.png', 
   38.0),
  ('Ankle sprained while trekking in the rainforest, had to be carried out on a stretcher', 
   '../client/src/assets/images/16sprained-ankle.png', 
   33.5),
  ('Contagious gastroenteritis outbreak on the ship, all passengers quarantined', 
   '../client/src/assets/images/17ship-illness.png', 
   45.0),
  ('Rope snapped during rock climbing, fell from halfway up the mountain', 
   '../client/src/assets/images/18rock-climbing-fall.png', 
   50.0),
  ('Lost direction while self-driving in the desert, ran out of water and fuel', 
   '../client/src/assets/images/19desert-stranded.png', 
   60.0),
  ('Caught in a blizzard at the summit, trapped on a 5000m peak', 
   '../client/src/assets/images/20snowstorm.png', 
   75.0),
  ('Hot air balloon loses control, lands in a dangerous canyon', 
   '../client/src/assets/images/21balloon-crash.png', 
   70.0),
  ('Intentional peak season price hike, originally cheap flight becomes extremely expensive', 
   '../client/src/assets/images/22flight-price-hike.png', 
   19.0),
  ('Scammed by a local “tour guide” into an expensive attraction, left penniless', 
   '../client/src/assets/images/23scam-tour.png', 
   27.5),
  ('Attacked and bitten by lions at a wildlife park', 
   '../client/src/assets/images/24lion-attack.png', 
   80.0),
  ('Trapped in an elevator for hours during a power outage, phone also dead', 
   '../client/src/assets/images/25stuck-elevator.png', 
   23.0),
  ('Visa on arrival policy suddenly changed, detained for three days', 
   '../client/src/assets/images/26visa-change.png', 
   55.0),
  ('Frostbite on the soles during a glacier trek, required toe amputation surgery', 
   '../client/src/assets/images/27frostbite.png', 
   65.0),
  ('Lost while mountain climbing, no phone navigation signal', 
   '../client/src/assets/images/28lost-hiker.png', 
   35.5),
  ('Bitten by insects in the rainforest, contracted malaria', 
   '../client/src/assets/images/29malaria.png', 
   58.0),
  ('Yacht engine failure on a night voyage, drifted into open sea', 
   '../client/src/assets/images/30boat-engine-fail.png', 
   42.5),
  ('Snow blindness during a polar expedition, blind for two hours', 
   '../client/src/assets/images/31snow-blind.png', 
   48.0),
  ('Missed the last train, forced to spend the night at the station', 
   '../client/src/assets/images/32missed-train.png', 
   13.5),
  ('Food poisoning from a roadside restaurant, hospitalized for three days', 
   '../client/src/assets/images/33restaurant-food-poison.png', 
   31.0),
  ('Stung by jellyfish while swimming at the beach, severe allergic reaction', 
   '../client/src/assets/images/34jellyfish-sting.png', 
   29.5),
  ('Phone stolen while exploring the city, lost all navigation', 
   '../client/src/assets/images/35phone-stolen.png', 
   24.0),
  ('Mistakenly took someone else\'s expensive suitcase, can\'t retrieve your own', 
   '../client/src/assets/images/36wrong-luggage.png', 
   17.0),
  ('Hotel reception in a mountain area overcharged double the room rate by mistake', 
   '../client/src/assets/images/37overcharged.png', 
   11.5),
  ('Hotel room flooded by a burst pipe, belongings soaked', 
   '../client/src/assets/images/38flooded-room.png', 
   21.0),
  ('Encountered severe turbulence on flight, all passengers vomited', 
   '../client/src/assets/images/39turbulence.png', 
   32.5),
  ('Mistaken for a terrorist while queuing at the airport, subjected to prolonged security interrogation', 
   '../client/src/assets/images/40airport-misunderstand.png', 
   36.0),
  ('Caught in an avalanche while skiing, rescue in valley extremely costly', 
   '../client/src/assets/images/41avalanche.png', 
   68.0),
  ('Hit by lightning while riding a hot air balloon, nearly killed', 
   '../client/src/assets/images/42balloon-lightning.png', 
   85.0),
  ('Fuel tank leak causing engine fire during desert off-roading', 
   '../client/src/assets/images/43desert-fire.png', 
   72.5),
  ('Boat capsized during an extreme water sport, drowned for three minutes', 
   '../client/src/assets/images/44raft-capsize.png', 
   77.0),
  ('Frostbite caused by sudden mountain weather change, lost both toes', 
   '../client/src/assets/images/45frostbite-toes.png', 
   88.0),
  ('Oxygen tank leaked during deep-sea diving, nearly suffocated', 
   '../client/src/assets/images/46deep-dive-leak.png', 
   90.0),
  ('Private plane crash, miraculously survived', 
   '../client/src/assets/images/47plane-crash-survive.png', 
   95.0),
  ('Lost in snowy mountain skiing for days, nearly froze to death', 
   '../client/src/assets/images/48snowstorm-lost.png', 
   92.5),
  ('Attacked by a shark at sea, right arm bitten off', 
   '../client/src/assets/images/49shark-attack.png', 
   100.0),
  ('Buried under collapsed ruins during exploration for 24 hours', 
   '../client/src/assets/images/50ruins-collapse.png', 
   98.0);
    `);
    */
  }

  console.log('✅ Seed done');
}
