// src/db/queries/wiki.js
const db = require('../../config/db');

// Get all wiki pages (lightweight list)
exports.listPages = async () => {
  const { rows } = await db.query(
    `SELECT id, title, slug, created_by, created_at, updated_at
     FROM wiki_pages
     ORDER BY title ASC`
  );
  return rows;
};

// Get a single page by slug
exports.getPageBySlug = async (slug) => {
  const { rows } = await db.query(
    `SELECT *
     FROM wiki_pages
     WHERE slug = $1`,
    [slug]
  );
  return rows[0];
};

// Get a single page by id
exports.getPageById = async (id) => {
  const { rows } = await db.query(
    `SELECT *
     FROM wiki_pages
     WHERE id = $1`,
    [id]
  );
  return rows[0];
};

// Create a new wiki page
exports.createPage = async ({ title, slug, content, created_by }) => {
  const { rows } = await db.query(
    `INSERT INTO wiki_pages (title, slug, content, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, slug, content, created_by]
  );
  return rows[0];
};

// Update an existing wiki page
exports.updatePage = async (id, { title, slug, content }) => {
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
  return rows[0];
};

// Delete a wiki page
exports.deletePage = async (id) => {
  const { rowCount } = await db.query(
    `DELETE FROM wiki_pages
     WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
};