// Centralized query key factory — Section 21
// All query keys in the app must come from here

export const queryKeys = {
  // Homepage
  homepage: ['homepage'] as const,

  // Taxonomy
  taxonomy: {
    all: ['taxonomy'] as const,
    categories: () => [...queryKeys.taxonomy.all, 'categories'] as const,
    services: (categoryId?: string) =>
      [...queryKeys.taxonomy.all, 'services', categoryId ?? 'all'] as const,
  },

  // Members
  members: {
    all: ['members'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.members.all, 'list', filters ?? {}] as const,
    detail: (slug: string) => [...queryKeys.members.all, 'detail', slug] as const,
    byId: (id: string) => [...queryKeys.members.all, 'id', id] as const,
    me: () => [...queryKeys.members.all, 'me'] as const,
    featured: () => [...queryKeys.members.all, 'featured'] as const,
  },

  // Articles
  articles: {
    all: ['articles'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.articles.all, 'list', filters ?? {}] as const,
    detail: (slug: string) => [...queryKeys.articles.all, 'detail', slug] as const,
    byId: (id: string) => [...queryKeys.articles.all, 'id', id] as const,
    mine: () => [...queryKeys.articles.all, 'mine'] as const,
    related: (id: string) => [...queryKeys.articles.all, 'related', id] as const,
  },

  // Events
  events: {
    all: ['events'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.events.all, 'list', filters ?? {}] as const,
    detail: (slug: string) => [...queryKeys.events.all, 'detail', slug] as const,
  },

  // Applications
  applications: {
    all: ['applications'] as const,
    me: () => [...queryKeys.applications.all, 'me'] as const,
  },

  // Consultation
  consultation: {
    all: ['consultation'] as const,
    received: () => [...queryKeys.consultation.all, 'received'] as const,
    sent: () => [...queryKeys.consultation.all, 'sent'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },

  // Search
  search: {
    all: ['search'] as const,
    results: (q: string, type: string) =>
      [...queryKeys.search.all, q, type] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
    digests: () => [...queryKeys.notifications.all, 'digests'] as const,
  },

  // Ops
  ops: {
    all: ['ops'] as const,
    stats: () => [...queryKeys.ops.all, 'stats'] as const,
    applications: (filters?: Record<string, unknown>) =>
      [...queryKeys.ops.all, 'applications', filters ?? {}] as const,
    application: (id: string) => [...queryKeys.ops.all, 'application', id] as const,
    members: (filters?: Record<string, unknown>) =>
      [...queryKeys.ops.all, 'members', filters ?? {}] as const,
    member: (id: string) => [...queryKeys.ops.all, 'member', id] as const,
    articles: (filters?: Record<string, unknown>) =>
      [...queryKeys.ops.all, 'articles', filters ?? {}] as const,
    article: (id: string) => [...queryKeys.ops.all, 'article', id] as const,
    seats: () => [...queryKeys.ops.all, 'seats'] as const,
    events: (filters?: Record<string, unknown>) =>
      [...queryKeys.ops.all, 'events', filters ?? {}] as const,
    broadcastLogs: () => [...queryKeys.ops.all, 'broadcast-logs'] as const,
    users: () => [...queryKeys.ops.all, 'users'] as const,
  },
};
