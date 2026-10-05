CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'photographer')),
  billing_street TEXT,
  billing_number TEXT,
  billing_complement TEXT,
  billing_neighborhood TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  accepted_terms_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE photographer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_key TEXT,
  cover_key TEXT,
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  modality TEXT NOT NULL CHECK (modality IN ('drift', 'autodromo', 'exibicao', 'arrancada')),
  city TEXT NOT NULL,
  state CHAR(2) NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  vehicle_type TEXT NOT NULL,
  bundle_price_cents INTEGER NOT NULL CHECK (bundle_price_cents >= 0),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (photographer_id, slug)
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  original_key TEXT NOT NULL,
  preview_key TEXT NOT NULL,
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  taken_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE album_tags (
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (album_id, tag_id)
);

CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, photo_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  platform_fee_cents INTEGER NOT NULL CHECK (platform_fee_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'pix')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE RESTRICT,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE RESTRICT,
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, photo_id)
);

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_albums_published_at ON albums (published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_albums_event_id ON albums (event_id);
CREATE INDEX idx_photos_album_id ON photos (album_id);
CREATE INDEX idx_order_items_photo_id ON order_items (photo_id);
CREATE INDEX idx_order_items_photographer_id ON order_items (photographer_id);
CREATE INDEX idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX idx_payouts_photographer_id ON payouts (photographer_id);
CREATE INDEX idx_events_event_date ON events (event_date DESC);
