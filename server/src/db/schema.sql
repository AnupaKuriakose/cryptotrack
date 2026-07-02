CREATE TABLE IF NOT EXISTS watchlist (
  id SERIAL PRIMARY KEY,
  coin_id VARCHAR(100) NOT NULL UNIQUE,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(20) NOT NULL,
  coin_image TEXT,
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  coin_id VARCHAR(100) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(20) NOT NULL,
  coin_image TEXT,
  quantity DECIMAL(20,8) NOT NULL,
  buy_price DECIMAL(20,8) NOT NULL,
  buy_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  coin_id VARCHAR(100) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(20) NOT NULL,
  condition VARCHAR(10) NOT NULL CHECK (condition IN ('above', 'below')),
  target_price DECIMAL(20,8) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered')),
  created_at TIMESTAMP DEFAULT NOW(),
  triggered_at TIMESTAMP
);
-- IF NOT EXISTS means running this twice won't throw an error 
-- safe to re-run. This is why migrate.js can be run multiple times without breaking anything.
--SERIAL = auto-incrementing integer. PostgreSQL automatically assigns 1, 2, 3... to each new row. PRIMARY KEY = unique identifier for each row, never null.
 --VARCHAR(100) = text up to 100 characters. NOT NULL = required field. UNIQUE = you can't add the same coin twice to the watchlist. CoinGecko uses string IDs like "bitcoin", "ethereum" — that's what goes here.
  --We store name, symbol, and image URL alongside the coin_id. Why? So the watchlist page can display coin info without making an extra CoinGecko call for every row. TEXT = unlimited length string (image URLs can be long).
  --TIMESTAMP = date + time. DEFAULT NOW() = automatically set to current time when a row is inserted. You never have to pass this value manually.
  --DECIMAL(20, 8) = number with up to 20 digits total, 8 after the decimal point. Crypto needs this precision — Bitcoin can be 0.00000001 BTC (one satoshi). A regular INTEGER or FLOAT would lose precision.
  --CHECK is a database-level constraint. Even if your Express validation somehow fails, PostgreSQL itself will reject any value that isn't 'above' or 'below'. Defense in depth.
  --Default value of 'active' on insert — you never have to pass status when creating an alert. It automatically starts as active.