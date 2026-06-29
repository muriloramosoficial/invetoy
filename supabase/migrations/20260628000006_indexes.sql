create index if not exists idx_rate_limits_cleanup
  on rate_limits(window_start);

-- Note: products.expiration_date does not exist yet on this remote
-- create index if not exists idx_products_expiration
--   on products(tenant_id, expiration_date);
-- Will be added when column is migrated

-- Note: products.batch does not exist yet on this remote
-- create index if not exists idx_products_batch
--   on products(tenant_id, batch);
-- Will be added when column is migrated
