import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

/** User-facing labels (internal schema still uses active / paused / retired). */
export function displayProjectStatus(status: ProjectStatus): string {
  if (status === 'active') return 'Front Burner';
  if (status === 'paused') return 'Back Burner';
  return status;
}

/** Still on the stove — active (front) or paused (back), not retired. */
export function isOngoingProject(project: CollectionEntry<'projects'>): boolean {
  const { status } = project.data;
  return status === 'active' || status === 'paused';
}
