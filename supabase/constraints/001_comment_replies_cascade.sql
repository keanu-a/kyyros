-- Make comments.parent_comment_id cascade on delete, so deleting a root comment
-- also removes replies inserted concurrently (JPA's cascade only deletes replies it loaded).
-- Hibernate generated the FK name, so look it up instead of hardcoding it.
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'comments'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'parent_comment_id';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.comments DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey
    FOREIGN KEY (parent_comment_id) REFERENCES public.comments (id)
    ON DELETE CASCADE;
END $$;

-- Verify: delete_rule should be CASCADE
-- SELECT rc.constraint_name, rc.delete_rule
-- FROM information_schema.referential_constraints rc
-- JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name
-- WHERE kcu.table_name = 'comments' AND kcu.column_name = 'parent_comment_id';
