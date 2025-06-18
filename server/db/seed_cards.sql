BEGIN TRANSACTION;

INSERT INTO cards (title, imgUrl, badLuckIdx) VALUES
  -- 1
  ('Missed boarding announcement at the airport, plane has already departed', 
   '../client/src/assets/images/1missed-fight.png', 
   10.0),
  -- 2
  ('Luggage lost at the airport, containing all your change of clothes', 
   '../client/src/assets/images/2lost-luggage.png', 
   20.0),
  -- 3
  ('Forgot passport at hotel, stopped by customs during departure', 
   '../client/src/assets/images/3passport-issue.png', 
   30.0),
  -- 4
  ('Booked hotel shows full due to system error, forced to stay in neighboring city', 
   '../client/src/assets/images/4hotel-full.png', 
   25.5),
  -- 5
  ('Taxi driver at midnight takes you to a remote area with no cell signal', 
   '../client/src/assets/images/5taxi-trouble.png', 
   18.5),
  -- 6
  ('Wallet stolen from your bag by a thief while taking photos at a tourist spot', 
   '../client/src/assets/images/6phone-stolen.png', 
   40.0),
  -- 7
  ('Rental car breaks down in the wilderness with no phone signal', 
   '../client/src/assets/images/7car-breakdown.png', 
   35.0),
  -- 8
  ('Missed the only bus, forced to walk back to the hotel', 
   '../client/src/assets/images/8missed-bus.png', 
   15.5),
  -- 9
  ('Got food poisoning on a cruise, suffer diarrhea for several days', 
   '../client/src/assets/images/9cruise-stomach.png', 
   22.0),
  -- 10
  ('Life jacket blown away by wind on the boat, almost fell into the water', 
   '../client/src/assets/images/10fallinto-water.png', 
   28.0),
  -- 11
  ('Accidentally threw boarding pass into the trash, spent 30 minutes searching at airport security', 
   '../client/src/assets/images/11travel-longqueue.png', 
   12.5),
  -- 12
  ('Booked Airbnb with terrible hygiene, house full of cockroaches', 
   '../client/src/assets/images/12room-cockroaches.png', 
   26.0),
  -- 13
  ('Locked out by hotel reception error at dawn, main gate locked', 
   '../client/src/assets/images/13lockedout-hotel.png', 
   16.0),
  -- 14
  ('Severe sunburn on the beach, skin peeling for a week', 
   '../client/src/assets/images/14sunburn.png', 
   14.0),
  -- 15
  ('Scuba gear malfunction while diving, nearly drowned', 
   '../client/src/assets/images/15scuba-trouble.png', 
   38.0),
  -- 16
  ('Ankle sprained while trekking in the rainforest, had to be carried out on a stretcher', 
   '../client/src/assets/images/16sprained-ankle.png', 
   33.5),
  -- 17
  ('Contagious gastroenteritis outbreak on the ship, all passengers quarantined', 
   '../client/src/assets/images/17ship-illness.png', 
   45.0),
  -- 18
  ('Rope snapped during rock climbing, fell from halfway up the mountain', 
   '../client/src/assets/images/18rock-climbing-fall.png', 
   50.0),
  -- 19
  ('Lost direction while self-driving in the desert, ran out of water and fuel', 
   '../client/src/assets/images/19desert-stranded.png', 
   60.0),
  -- 20
  ('Caught in a blizzard at the summit, trapped on a 5000m peak', 
   '../client/src/assets/images/20snowstorm.png', 
   75.0),
  -- 21
  ('Hot air balloon loses control, lands in a dangerous canyon', 
   '../client/src/assets/images/21balloon-crash.png', 
   70.0),
  -- 22
  ('Intentional peak season price hike, originally cheap flight becomes extremely expensive', 
   '../client/src/assets/images/22flight-price-hike.png', 
   19.0),
  -- 23
  ('Scammed by a local “tour guide” into an expensive attraction, left penniless', 
   '../client/src/assets/images/23scam-tour.png', 
   27.5),
  -- 24
  ('Attacked and bitten by lions at a wildlife park', 
   '../client/src/assets/images/24lion-attack.png', 
   80.0),
  -- 25
  ('Trapped in an elevator for hours during a power outage, phone also dead', 
   '../client/src/assets/images/25stuck-elevator.png', 
   23.0),
  -- 26
  ('Visa on arrival policy suddenly changed, detained for three days', 
   '../client/src/assets/images/26visa-change.png', 
   55.0),
  -- 27
  ('Frostbite on the soles during a glacier trek, required toe amputation surgery', 
   '../client/src/assets/images/27frostbite.png', 
   65.0),
  -- 28
  ('Lost while mountain climbing, no phone navigation signal', 
   '../client/src/assets/images/28lost-hiker.png', 
   35.5),
  -- 29
  ('Bitten by insects in the rainforest, contracted malaria', 
   '../client/src/assets/images/29malaria.png', 
   58.0),
  -- 30
  ('Yacht engine failure on a night voyage, drifted into open sea', 
   '../client/src/assets/images/30boat-engine-fail.png', 
   42.5),
  -- 31
  ('Snow blindness during a polar expedition, blind for two hours', 
   '../client/src/assets/images/31snow-blind.png', 
   48.0),
  -- 32
  ('Missed the last train, forced to spend the night at the station', 
   '../client/src/assets/images/32missed-train.png', 
   13.5),
  -- 33
  ('Food poisoning from a roadside restaurant, hospitalized for three days', 
   '../client/src/assets/images/33restaurant-food-poison.png', 
   31.0),
  -- 34
  ('Stung by jellyfish while swimming at the beach, severe allergic reaction', 
   '../client/src/assets/images/34jellyfish-sting.png', 
   29.5),
  -- 35
  ('Phone stolen while exploring the city, lost all navigation', 
   '../client/src/assets/images/35phone-stolen.png', 
   24.0),
  -- 36
  ('Mistakenly took someone else\'s expensive suitcase, can\'t retrieve your own', 
   '../client/src/assets/images/36wrong-luggage.png', 
   17.0),
  -- 37
  ('Hotel reception in a mountain area overcharged double the room rate by mistake', 
   '../client/src/assets/images/37overcharged.png', 
   11.5),
  -- 38
  ('Hotel room flooded by a burst pipe, belongings soaked', 
   '../client/src/assets/images/38flooded-room.png', 
   21.0),
  -- 39
  ('Encountered severe turbulence on flight, all passengers vomited', 
   '../client/src/assets/images/39turbulence.png', 
   32.5),
  -- 40
  ('Mistaken for a terrorist while queuing at the airport, subjected to prolonged security interrogation', 
   '../client/src/assets/images/40airport-misunderstand.png', 
   36.0),
  -- 41
  ('Caught in an avalanche while skiing, rescue in valley extremely costly', 
   '../client/src/assets/images/41avalanche.png', 
   68.0),
  -- 42
  ('Hit by lightning while riding a hot air balloon, nearly killed', 
   '../client/src/assets/images/42balloon-lightning.png', 
   85.0),
  -- 43
  ('Fuel tank leak causing engine fire during desert off-roading', 
   '../client/src/assets/images/43desert-fire.png', 
   72.5),
  -- 44
  ('Boat capsized during an extreme water sport, drowned for three minutes', 
   '../client/src/assets/images/44raft-capsize.png', 
   77.0),
  -- 45
  ('Frostbite caused by sudden mountain weather change, lost both toes', 
   '../client/src/assets/images/45frostbite-toes.png', 
   88.0),
  -- 46
  ('Oxygen tank leaked during deep-sea diving, nearly suffocated', 
   '../client/src/assets/images/46deep-dive-leak.png', 
   90.0),
  -- 47
  ('Private plane crash, miraculously survived', 
   '../client/src/assets/images/47plane-crash-survive.png', 
   95.0),
  -- 48
  ('Lost in snowy mountain skiing for days, nearly froze to death', 
   '../client/src/assets/images/48snowstorm-lost.png', 
   92.5),
  -- 49
  ('Attacked by a shark at sea, right arm bitten off', 
   '../client/src/assets/images/49shark-attack.png', 
   100.0),
  -- 50
  ('Buried under collapsed ruins during exploration for 24 hours', 
   '../client/src/assets/images/50ruins-collapse.png', 
   98.0);

COMMIT;
