-- Storage remove() looks objects up before deleting them, so without a SELECT
-- policy an admin's delete silently removes nothing and product images stay
-- in the bucket after the product or image is deleted. Safe to run more than once.
drop policy if exists "products admin select" on storage.objects;
create policy "products admin select" on storage.objects for select
  using (bucket_id = 'products' and private.is_admin());
