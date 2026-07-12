import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

/** User-facing labels (internal schema still uses active / maintained / paused / retired). */
export function displayProjectStatus(status: ProjectStatus): string {
  if (status === 'active') return 'Front Burner';
  if (status === 'maintained') return 'Simmering';
  if (status === 'paused') return 'Back Burner';
  return status;
}

/** Still on the stove — active, maintained, or paused; not retired. */
export function isOngoingProject(project: CollectionEntry<'projects'>): boolean {
  const { status } = project.data;
  return status === 'active' || status === 'maintained' || status === 'paused';
}
