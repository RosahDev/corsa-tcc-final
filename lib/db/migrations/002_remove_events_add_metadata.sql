-- Migrate event metadata into albums before dropping events
ALTER TABLE albums ADD COLUMN IF NOT EXISTS state CHAR(2);
ALTER TABLE albums ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS modality TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS coverage_date DATE;

UPDATE albums a
SET
  state = e.state,
  city = e.city,
  modality = e.modality,
  coverage_date = e.event_date
FROM events e
WHERE a.event_id = e.id
  AND (a.state IS NULL OR a.city IS NULL OR a.modality IS NULL);

ALTER TABLE albums
  ALTER COLUMN state SET NOT NULL,
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN modality SET NOT NULL;

ALTER TABLE albums
  ADD CONSTRAINT albums_modality_check
  CHECK (modality IN ('drift', 'autodromo', 'exibicao', 'arrancada'));

DROP INDEX IF EXISTS idx_albums_event_id;
ALTER TABLE albums DROP COLUMN IF EXISTS event_id;

DROP INDEX IF EXISTS idx_events_event_date;
DROP TABLE IF EXISTS events;

CREATE INDEX IF NOT EXISTS idx_albums_modality ON albums (modality);
CREATE INDEX IF NOT EXISTS idx_albums_state_city ON albums (state, city);
CREATE INDEX IF NOT EXISTS idx_albums_coverage_date ON albums (coverage_date DESC);

-- Photo filter metadata
ALTER TABLE photos ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS car_brand TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS car_model TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS car_color TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

CREATE INDEX IF NOT EXISTS idx_photos_car_brand ON photos (car_brand) WHERE car_brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_photos_vehicle_type ON photos (vehicle_type) WHERE vehicle_type IS NOT NULL;
