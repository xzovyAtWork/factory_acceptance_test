const db = require('../config/db');

exports.listPages = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, slug, created_at, updated_at FROM wiki_pages ORDER BY title ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getPageBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const { rows } = await db.query(
      'SELECT * FROM wiki_pages WHERE slug = $1',
      [slug]
    );
    const page = rows[0];
    if (!page) return res.status(404).json({ error: 'Wiki page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

exports.createPage = async (req, res, next) => {
  try {
    const { title, slug, content } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { rows } = await db.query(
      `INSERT INTO wiki_pages (title, slug, content, created_by)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [title, slug, content, req.user.id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updatePage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, slug, content } = req.body;

    const { rows } = await db.query(
      `UPDATE wiki_pages
       SET title = COALESCE($2, title),
           slug = COALESCE($3, slug),
           content = COALESCE($4, content),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, title, slug, content]
    );

    const page = rows[0];
    if (!page) return res.status(404).json({ error: 'Wiki page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

exports.deletePage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await db.query(
      'DELETE FROM wiki_pages WHERE id = $1',
      [id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Wiki page not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};