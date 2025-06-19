BEGIN TRANSACTION;

INSERT INTO cards (title, imgUrl, badLuckIdx) VALUES
  -- 1
  ('missed-flight', 
   '/src/assets/images/1missed-flight.png', 
   10.0),
  -- 2
  ('lost-luggage', 
   '/src/assets/images/2lost-luggage.png', 
   20.0),
  -- 3
  ('passport-issue', 
   '/src/assets/images/3passport-issue.png', 
   30.0),
  -- 4
  ('hotel-full', 
   '/src/assets/images/4hotel-full.png', 
   25.5),
  -- 5
  ('taxi-trouble', 
   '/src/assets/images/5taxi-trouble.png', 
   18.5),
  -- 6
  ('wallet-stolen', 
   '/src/assets/images/6phone-stolen.png', 
   40.0),
  -- 7
  ('car-breakdown', 
   '/src/assets/images/7car-breakdown.png', 
   35.0),
  -- 8
  ('missed-bus', 
   '/src/assets/images/8missed-bus.png', 
   15.5),
  -- 9
  ('cruise-stomach', 
   '/src/assets/images/9cruise-stomach.png', 
   22.0),
  -- 10
  ('fallinto-water', 
   '/src/assets/images/10fallinto-water.png', 
   28.0),
  -- 11
  ('travel-longqueue', 
   '/src/assets/images/11travel-longqueue.png', 
   12.5),
  -- 12
  ('room-cockroaches', 
   '/src/assets/images/12room-cockroaches.png', 
   26.0),
  -- 13
  ('lockedout-hotel', 
   '/src/assets/images/13lockedout-hotel.png', 
   16.0),
  -- 14
  ('severe-sunburn', 
   '/src/assets/images/14severe-sunburn.png', 
   14.0),
  -- 15
  ('scuba-trouble', 
   '/src/assets/images/15scuba-trouble.png', 
   38.0),
  -- 16
  ('sprained-ankle', 
   '/src/assets/images/16sprained-ankle.png', 
   33.5),
  -- 17
  ('ship-quarantine', 
   '/src/assets/images/17ship-quarantine.png', 
   45.0),
  -- 18
  ('climbing-rope-break', 
   '/src/assets/images/18climbing-rope-break.png', 
   50.0),
  -- 19
  ('lost-in-desert', 
   '/src/assets/images/19lost-in-desert.png', 
   60.0),
  -- 20
  ('blizzard-trapped', 
   '/src/assets/images/20blizzard-trapped.png', 
   75.0),
  -- 21
  ('balloon-crash', 
   '/src/assets/images/21balloon-crash.png', 
   70.0),
  -- 22
  ('flight-price-hike', 
   '/src/assets/images/22flight-price-hike.png', 
   19.0),
  -- 23
  ('scam-tour', 
   '/src/assets/images/23scam-tour.png', 
   27.5),
  -- 24
  ('lion-attack', 
   '/src/assets/images/24lion-attack.png', 
   80.0),
  -- 25
  ('stuckin-elevator', 
   '/src/assets/images/25stuckin-elevator.png', 
   23.0),
  -- 26
  ('visa-detained', 
   '/src/assets/images/26visa-detained.png', 
   55.0),
  -- 27
  ('frostbite-glacier', 
   '/src/assets/images/27frostbite-glacier.png', 
   65.0),
  -- 28
  ('lost-mountain', 
   '/src/assets/images/28lost-mountain.png', 
   35.5),
  -- 29
  ('malaria-bite', 
   '/src/assets/images/29malaria-bite.png', 
   58.0),
  -- 30
  ('boat-engine-fail', 
   '/src/assets/images/30boat-engine-fail.png', 
   42.5),
  -- 31
  ('snow-blindness', 
   '/src/assets/images/31snow-blindness.png', 
   48.0),
  -- 32
  ('missed-lasttrain', 
   '/src/assets/images/32missed-lasttrain.png', 
   13.5),
  -- 33
  ('roadside-foodpoison', 
   '/src/assets/images/33roadside-foodpoison.png', 
   31.0),
  -- 34
  ('jellyfish-sting', 
   '/src/assets/images/34jellyfish-sting.png', 
   29.5),
  -- 35
  ('phone-stolen', 
   '/src/assets/images/35phone-stolen.png', 
   24.0),
  -- 36
  ('wrong-luggage', 
   '/src/assets/images/36wrong-luggage.png', 
   17.0),
  -- 37
  ('hotel-overcharged', 
   '/src/assets/images/37hotel-overcharged.png', 
   11.5),
  -- 38
  ('flooded-room', 
   '/src/assets/images/38flooded-room.png', 
   21.0),
  -- 39
  ('flight-turbulence',
   '/src/assets/images/39flight-turbulence.png', 
   32.5),
  -- 40
  ('airport-security-misunderstand', 
   '/src/assets/images/40airport-security-misunderstand.png', 
   36.0),
  -- 41
  ('sking-avalanche', 
   '/src/assets/images/41sking-avalanche.png', 
   68.0),
  -- 42
  ('balloon-lightning', 
   '/src/assets/images/42balloon-lightning.png', 
   85.0),
  -- 43
  ('desert-fire', 
   '/src/assets/images/43desert-fire.png', 
   72.5),
  -- 44
  ('raft-capsize', 
   '/src/assets/images/44raft-capsize.png', 
   77.0),
  -- 45
  ('frostbite-toes', 
   '/src/assets/images/45frostbite-toes.png', 
   88.0),
  -- 46
  ('oxygen-leak', 
   '/src/assets/images/46oxygen-leak.png', 
   90.0),
  -- 47
  ('plane-crash', 
   '/src/assets/images/47plane-crash.png', 
   95.0),
  -- 48
  ('lost-snowstorm', 
   '/src/assets/images/48lost-snowstorm.png', 
   92.5),
  -- 49
  ('shark-attack', 
   '/src/assets/images/49shark-attack.png', 
   100.0),
  -- 50
  ('buried-ruins', 
   '/src/assets/images/50buried-ruins.png', 
   98.0);

COMMIT;