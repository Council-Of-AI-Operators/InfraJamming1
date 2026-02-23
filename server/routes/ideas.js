import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET all ideas (with optional filters)
router.get('/', (req, res) => {
  try {
    const { status, priority, search } = req.query;

    let query = 'SELECT * FROM ideas WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const ideas = db.prepare(query).all(...params);

    // Parse tags JSON for each idea
    const parsedIdeas = ideas.map(idea => ({
      ...idea,
      tags: JSON.parse(idea.tags || '[]')
    }));

    res.json(parsedIdeas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single idea by ID
router.get('/:id', (req, res) => {
  try {
    const idea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    idea.tags = JSON.parse(idea.tags || '[]');
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new idea
router.post('/', (req, res) => {
  try {
    const { title, description, priority, status, due_date, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = ['idea', 'in-progress', 'completed', 'archived'];

    const finalPriority = validPriorities.includes(priority) ? priority : 'medium';
    const finalStatus = validStatuses.includes(status) ? status : 'idea';
    const finalTags = JSON.stringify(Array.isArray(tags) ? tags : []);

    const stmt = db.prepare(`
      INSERT INTO ideas (title, description, priority, status, due_date, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      description || null,
      finalPriority,
      finalStatus,
      due_date || null,
      finalTags
    );

    const newIdea = db.prepare('SELECT * FROM ideas WHERE id = ?').get(result.lastInsertRowid);
    newIdea.tags = JSON.parse(newIdea.tags || '[]');

    res.status(201).json(newIdea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update idea
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const { title, description, priority, status, due_date, tags } = req.body;

    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = ['idea', 'in-progress', 'completed', 'archived'];

    const finalTitle = title?.trim() || existing.title;
    const finalDescription = description !== undefined ? description : existing.description;
    const finalPriority = validPriorities.includes(priority) ? priority : existing.priority;
    const finalStatus = validStatuses.includes(status) ? status : existing.status;
    const finalDueDate = due_date !== undefined ? due_date : existing.due_date;
    const finalTags = tags !== undefined ? JSON.stringify(Array.isArray(tags) ? tags : []) : existing.tags;

    const stmt = db.prepare(`
      UPDATE ideas
      SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, tags = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(finalTitle, finalDescription, finalPriority, finalStatus, finalDueDate, finalTags, req.params.id);

    const updated = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);
    updated.tags = JSON.parse(updated.tags || '[]');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE idea
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM ideas WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    db.prepare('DELETE FROM ideas WHERE id = ?').run(req.params.id);

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
