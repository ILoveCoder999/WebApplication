-- File: server/db/seed_cards.sql

BEGIN TRANSACTION;

INSERT INTO cards (title, imgUrl, badLuckIdx) VALUES
  -- 1
  ('Missed boarding announcement at the airport, plane has already departed', 
   'https://picsum.photos/seed/miss_gate/200/300', 
   10.0),
  -- 2
  ('Luggage lost at the airport, containing all your change of clothes', 
   'https://picsum.photos/seed/lost_luggage/200/300', 
   20.0),
  -- 3
  ('Forgot passport at hotel, stopped by customs during departure', 
   'https://picsum.photos/seed/no_passport/200/300', 
   30.0),
  -- 4
  ('Booked hotel shows full due to system error, forced to stay in neighboring city', 
   'https://picsum.photos/seed/hotel_full/200/300', 
   25.5),
  -- 5
  ('Taxi driver at midnight takes you to a remote area with no cell signal', 
   'https://picsum.photos/seed/bad_taxi/200/300', 
   18.5),
  -- 6
  ('Wallet stolen from your bag by a thief while taking photos at a tourist spot', 
   'https://picsum.photos/seed/wallet_stolen/200/300', 
   40.0),
  -- 7
  ('Rental car breaks down in the wilderness with no phone signal', 
   'https://picsum.photos/seed/car_breakdown/200/300', 
   35.0),
  -- 8
  ('Missed the only bus, forced to walk back to the hotel', 
   'https://picsum.photos/seed/missed_bus/200/300', 
   15.5),
  -- 9
  ('Got food poisoning on a cruise, suffer diarrhea for several days', 
   'https://picsum.photos/seed/food_poisoning/200/300', 
   22.0),
  -- 10
  ('Life jacket blown away by wind on the boat, almost fell into the water', 
   'https://picsum.photos/seed/lost_lifejacket/200/300', 
   28.0),
  -- 11
  ('Accidentally threw boarding pass into the trash, spent 30 minutes searching at airport security', 
   'https://picsum.photos/seed/boarding_pass_gone/200/300', 
   12.5),
  -- 12
  ('Booked Airbnb with terrible hygiene, house full of cockroaches', 
   'https://picsum.photos/seed/dirty_airbnb/200/300', 
   26.0),
  -- 13
  ('Locked out by hotel reception error at dawn, main gate locked', 
   'https://picsum.photos/seed/locked_out/200/300', 
   16.0),
  -- 14
  ('Severe sunburn on the beach, skin peeling for a week', 
   'https://picsum.photos/seed/sunburn/200/300', 
   14.0),
  -- 15
  ('Scuba gear malfunction while diving, nearly drowned', 
   'https://picsum.photos/seed/scuba_trouble/200/300', 
   38.0),
  -- 16
  ('Ankle sprained while trekking in the rainforest, had to be carried out on a stretcher', 
   'https://picsum.photos/seed/sprained_ankle/200/300', 
   33.5),
  -- 17
  ('Contagious gastroenteritis outbreak on the ship, all passengers quarantined', 
   'https://picsum.photos/seed/ship_illness/200/300', 
   45.0),
  -- 18
  ('Rope snapped during rock climbing, fell from halfway up the mountain', 
   'https://picsum.photos/seed/rock_climbing_fall/200/300', 
   50.0),
  -- 19
  ('Lost direction while self-driving in the desert, ran out of water and fuel', 
   'https://picsum.photos/seed/desert_stranded/200/300', 
   60.0),
  -- 20
  ('Caught in a blizzard at the summit, trapped on a 5000m peak', 
   'https://picsum.photos/seed/snowstorm/200/300', 
   75.0),
  -- 21
  ('Hot air balloon loses control, lands in a dangerous canyon', 
   'https://picsum.photos/seed/balloon_crash/200/300', 
   70.0),
  -- 22
  ('Intentional peak season price hike, originally cheap flight becomes extremely expensive', 
   'https://picsum.photos/seed/flight_price_hike/200/300', 
   19.0),
  -- 23
  ('Scammed by a local “tour guide” into an expensive attraction, left penniless', 
   'https://picsum.photos/seed/scam_tour/200/300', 
   27.5),
  -- 24
  ('Attacked and bitten by lions at a wildlife park', 
   'https://picsum.photos/seed/lion_attack/200/300', 
   80.0),
  -- 25
  ('Trapped in an elevator for hours during a power outage, phone also dead', 
   'https://picsum.photos/seed/stuck_elevator/200/300', 
   23.0),
  -- 26
  ('Visa on arrival policy suddenly changed, detained for three days', 
   'https://picsum.photos/seed/visa_change/200/300', 
   55.0),
  -- 27
  ('Frostbite on the soles during a glacier trek, required toe amputation surgery', 
   'https://picsum.photos/seed/frostbite/200/300', 
   65.0),
  -- 28
  ('Lost while mountain climbing, no phone navigation signal', 
   'https://picsum.photos/seed/lost_hiker/200/300', 
   35.5),
  -- 29
  ('Bitten by insects in the rainforest, contracted malaria', 
   'https://picsum.photos/seed/malaria/200/300', 
   58.0),
  -- 30
  ('Yacht engine failure on a night voyage, drifted into open sea', 
   'https://picsum.photos/seed/boat_engine_fail/200/300', 
   42.5),
  -- 31
  ('Snow blindness during a polar expedition, blind for two hours', 
   'https://picsum.photos/seed/snow_blind/200/300', 
   48.0),
  -- 32
  ('Missed the last train, forced to spend the night at the station', 
   'https://picsum.photos/seed/missed_train/200/300', 
   13.5),
  -- 33
  ('Food poisoning from a roadside restaurant, hospitalized for three days', 
   'https://picsum.photos/seed/restaurant_food_poison/200/300', 
   31.0),
  -- 34
  ('Stung by jellyfish while swimming at the beach, severe allergic reaction', 
   'https://picsum.photos/seed/jellyfish_sting/200/300', 
   29.5),
  -- 35
  ('Phone stolen while exploring the city, lost all navigation', 
   'https://picsum.photos/seed/phone_stolen/200/300', 
   24.0),
  -- 36
  ('Mistakenly took someone else\'s expensive suitcase, can\'t retrieve your own', 
   'https://picsum.photos/seed/wrong_luggage/200/300', 
   17.0),
  -- 37
  ('Hotel reception in a mountain area overcharged double the room rate by mistake', 
   'https://picsum.photos/seed/overcharged/200/300', 
   11.5),
  -- 38
  ('Hotel room flooded by a burst pipe, belongings soaked', 
   'https://picsum.photos/seed/flooded_room/200/300', 
   21.0),
  -- 39
  ('Encountered severe turbulence on flight, all passengers vomited', 
   'https://picsum.photos/seed/turbulence/200/300', 
   32.5),
  -- 40
  ('Mistaken for a terrorist while queuing at the airport, subjected to prolonged security interrogation', 
   'https://picsum.photos/seed/airport_misunderstand/200/300', 
   36.0),
  -- 41
  ('Caught in an avalanche while skiing, rescue in valley extremely costly', 
   'https://picsum.photos/seed/avalanche/200/300', 
   68.0),
  -- 42
  ('Hit by lightning while riding a hot air balloon, nearly killed', 
   'https://picsum.photos/seed/balloon_lightning/200/300', 
   85.0),
  -- 43
  ('Fuel tank leak causing engine fire during desert off-roading', 
   'https://picsum.photos/seed/desert_fire/200/300', 
   72.5),
  -- 44
  ('Boat capsized during an extreme water sport, drowned for three minutes', 
   'https://picsum.photos/seed/raft_capsize/200/300', 
   77.0),
  -- 45
  ('Frostbite caused by sudden mountain weather change, lost both toes', 
   'https://picsum.photos/seed/frostbite_toes/200/300', 
   88.0),
  -- 46
  ('Oxygen tank leaked during deep-sea diving, nearly suffocated', 
   'https://picsum.photos/seed/deep_dive_leak/200/300', 
   90.0),
  -- 47
  ('Private plane crash, miraculously survived', 
   'https://picsum.photos/seed/plane_crash_survive/200/300', 
   95.0),
  -- 48
  ('Lost in snowy mountain skiing for days, nearly froze to death', 
   'https://picsum.photos/seed/snowstorm_lost/200/300', 
   92.5),
  -- 49
  ('Attacked by a shark at sea, right arm bitten off', 
   'https://picsum.photos/seed/shark_attack/200/300', 
   100.0),
  -- 50
  ('Buried under collapsed ruins during exploration for 24 hours', 
   'https://picsum.photos/seed/ruins_collapse/200/300', 
   98.0);

COMMIT;
