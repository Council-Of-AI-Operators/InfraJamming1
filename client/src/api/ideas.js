const API_BASE = '/api/ideas';

export async function fetchIdeas(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.search) params.set('search', filters.search);

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch ideas');
  }

  return response.json();
}

export async function fetchIdea(id) {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch idea');
  }

  return response.json();
}

export async function createIdea(idea) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(idea)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create idea');
  }

  return response.json();
}

export async function updateIdea(id, updates) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update idea');
  }

  return response.json();
}

export async function deleteIdea(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete idea');
  }

  return response.json();
}
