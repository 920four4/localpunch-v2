-- Optional cover alt text and structured FAQ pairs for blog posts.
-- Both columns are nullable so existing rows keep working. FAQPage JSON-LD
-- can also be derived from a trailing FAQ markdown section when faq is null.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS cover_image_alt TEXT;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS faq JSONB;

COMMENT ON COLUMN blog_posts.cover_image_alt IS
  'Optional alt text for cover_image_url. Shown on the post and blog index, and used as og:image alt.';

COMMENT ON COLUMN blog_posts.faq IS
  'Optional FAQ pairs [{question, answer}]. When null, a trailing FAQ markdown section supplies FAQPage JSON-LD.';
