-- The 404 game's running record for each pet, across everyone who plays (functions/api/four.ts)
CREATE TABLE IF NOT EXISTS pet_stats (
  pet TEXT PRIMARY KEY,
  wins INTEGER NOT NULL DEFAULT 0,   -- the pet beat a player
  losses INTEGER NOT NULL DEFAULT 0, -- a player beat the pet
  draws INTEGER NOT NULL DEFAULT 0
);
