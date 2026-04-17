-- Blog posts
-- Public blog with draft/published lifecycle. Admin-only writes. Public reads
-- of published posts only. Feeds /blog, /blog/[slug], sitemap, llms.txt, and
-- the programmatic admin API.

CREATE TABLE IF NOT EXISTS blog_posts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT NOT NULL UNIQUE,
  title                 TEXT NOT NULL,
  excerpt               TEXT,
  content               TEXT NOT NULL,
  cover_image_url       TEXT,
  tags                  TEXT[] NOT NULL DEFAULT '{}',
  author_name           TEXT NOT NULL DEFAULT 'LocalPunch Team',
  status                TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  published_at          TIMESTAMPTZ,
  seo_title             TEXT,
  seo_description       TEXT,
  reading_time_minutes  INTEGER,
  created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at
  ON blog_posts(status, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON blog_posts(slug);

CREATE INDEX IF NOT EXISTS idx_blog_posts_tags
  ON blog_posts USING GIN(tags);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_touch ON blog_posts;
CREATE TRIGGER trg_blog_posts_touch
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read published blog posts" ON blog_posts;
CREATE POLICY "read published blog posts" ON blog_posts
  FOR SELECT
  USING (
    status = 'published' AND (published_at IS NULL OR published_at <= NOW())
  );

DROP POLICY IF EXISTS "admin full access blog posts" ON blog_posts;
CREATE POLICY "admin full access blog posts" ON blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE blog_posts IS
  'Public blog posts. Public can read published; admins have full CRUD.';
