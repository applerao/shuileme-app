-- Checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('bedtime', 'wakeup')),
  timestamp TIMESTAMP NOT NULL,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checkins_userId ON checkins("userId");
CREATE INDEX idx_checkins_timestamp ON checkins(timestamp);
CREATE INDEX idx_checkins_type ON checkins(type);

-- Sleep records table
CREATE TABLE IF NOT EXISTS sleep_records (
  id SERIAL PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  bedtime TIMESTAMP NOT NULL,
  "wakeupTime" TIMESTAMP NOT NULL,
  duration BIGINT NOT NULL,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sleep_records_userId ON sleep_records("userId");
CREATE INDEX idx_sleep_records_bedtime ON sleep_records(bedtime);
CREATE INDEX idx_sleep_records_wakeupTime ON sleep_records("wakeupTime");
