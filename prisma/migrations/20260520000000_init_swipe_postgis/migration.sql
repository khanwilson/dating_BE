-- Enable PostGIS extension (requires postgis/postgis Docker image)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Swipe table
CREATE TABLE IF NOT EXISTS "Swipe" (
    "id"         TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId"   TEXT NOT NULL,
    "action"     TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Swipe_fromUserId_toUserId_key" UNIQUE ("fromUserId", "toUserId"),
    CONSTRAINT "Swipe_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Swipe_toUserId_fkey"   FOREIGN KEY ("toUserId")   REFERENCES "User"("id") ON DELETE CASCADE
);

-- PostGIS geography column on UserLocation
ALTER TABLE "UserLocation"
    ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Backfill existing rows
UPDATE "UserLocation"
SET location = ST_MakePoint(lng, lat)::geography
WHERE location IS NULL;

-- Spatial index for ST_DWithin queries
CREATE INDEX IF NOT EXISTS idx_userlocation_location
    ON "UserLocation" USING GIST (location);
