import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

/** Neutral, user-facing status labels (where a project stands, not how much focus it gets — see projectTiers). */
export function displayProjectStatus(status: ProjectStatus): string {
  if (status === 'active') return 'Active';
  if (status === 'maintained') return 'Maintained';
  if (status === 'paused') return 'Paused';
  return 'Archived';
}

/** Still going in some form — active, maintained, or paused; not retired. */
export function isOngoingProject(project: CollectionEntry<'projects'>): boolean {
  const { status } = project.data;
  return status === 'active' || status === 'maintained' || status === 'paused';
}
