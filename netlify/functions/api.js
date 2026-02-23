const { getStore } = require("@netlify/blobs");

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['idea', 'in-progress', 'completed', 'archived'];

const SEED_DATA = [
  {
    id: 1,
    title: 'Build a habit tracker with streaks',
    description: 'A simple app that tracks daily habits and shows streak counts to keep users motivated.',
    priority: 'high',
    status: 'in-progress',
    due_date: '2026-03-15',
    tags: ['productivity', 'mobile'],
    created_at: '2026-02-20T10:00:00.000Z',
    updated_at: '2026-02-20T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Weekly newsletter for dev tips',
    description: 'Curate and send a short weekly email with one actionable coding tip.',
    priority: 'medium',
    status: 'idea',
    due_date: null,
    tags: ['content', 'writing'],
    created_at: '2026-02-19T14:30:00.000Z',
    updated_at: '2026-02-19T14:30:00.000Z'
  },
  {
    id: 3,
    title: 'Automate invoice generation',
    description: 'Script that pulls time-tracking data and generates PDF invoices automatically.',
    priority: 'low',
    status: 'completed',
    due_date: '2026-02-10',
    tags: ['automation', 'finance'],
    created_at: '2026-02-01T09:00:00.000Z',
    updated_at: '2026-02-10T16:00:00.000Z'
  }
];

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

function respond(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function getRoute(eventPath) {
  return eventPath
    .replace(/^\/?\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
}

async function loadIdeas(store) {
  const raw = await store.get("ideas", { type: "json" });
  if (!raw) {
    await store.setJSON("ideas", SEED_DATA);
    await store.setJSON("nextId", SEED_DATA.length + 1);
    return SEED_DATA;
  }
  return raw;
}

async function saveIdeas(store, ideas) {
  await store.setJSON("ideas", ideas);
}

async function getNextId(store) {
  const id = await store.get("nextId", { type: "json" });
  const nextId = id || SEED_DATA.length + 1;
  await store.setJSON("nextId", nextId + 1);
  return nextId;
}

exports.handler = async function (event) {
  const method = event.httpMethod;
  const route = getRoute(event.path);

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (route === '/health') {
    return respond(200, { status: 'ok' });
  }

  const store = getStore("actionable-ideas-data");

  // Routes: /ideas or /ideas/
  if (route === '/ideas' || route === '/ideas/' || route === '' || route === '/') {
    if (method === 'GET') {
      const ideas = await loadIdeas(store);
      const params = event.queryStringParameters || {};
      let filtered = [...ideas];

      if (params.status) {
        filtered = filtered.filter(i => i.status === params.status);
      }
      if (params.priority) {
        filtered = filtered.filter(i => i.priority === params.priority);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(i =>
          i.title.toLowerCase().includes(s) ||
          (i.description && i.description.toLowerCase().includes(s))
        );
      }

      return respond(200, filtered);
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      if (!body.title || !body.title.trim()) {
        return respond(400, { error: 'Title is required' });
      }

      const ideas = await loadIdeas(store);
      const newId = await getNextId(store);

      const newIdea = {
        id: newId,
        title: body.title.trim(),
        description: body.description || null,
        priority: VALID_PRIORITIES.includes(body.priority) ? body.priority : 'medium',
        status: VALID_STATUSES.includes(body.status) ? body.status : 'idea',
        due_date: body.due_date || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      ideas.unshift(newIdea);
      await saveIdeas(store, ideas);
      return respond(201, newIdea);
    }
  }

  // Routes: /ideas/:id
  const idMatch = route.match(/^\/ideas\/(\d+)$/);
  if (idMatch) {
    const id = parseInt(idMatch[1], 10);
    const ideas = await loadIdeas(store);
    const index = ideas.findIndex(i => i.id === id);

    if (index === -1) {
      return respond(404, { error: 'Idea not found' });
    }

    if (method === 'GET') {
      return respond(200, ideas[index]);
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const existing = ideas[index];

      ideas[index] = {
        ...existing,
        title: body.title?.trim() || existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        priority: VALID_PRIORITIES.includes(body.priority) ? body.priority : existing.priority,
        status: VALID_STATUSES.includes(body.status) ? body.status : existing.status,
        due_date: body.due_date !== undefined ? body.due_date : existing.due_date,
        tags: body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags : []) : existing.tags,
        updated_at: new Date().toISOString()
      };

      await saveIdeas(store, ideas);
      return respond(200, ideas[index]);
    }

    if (method === 'DELETE') {
      ideas.splice(index, 1);
      await saveIdeas(store, ideas);
      return respond(200, { message: 'Idea deleted successfully' });
    }
  }

  return respond(404, { error: 'Not found' });
};
