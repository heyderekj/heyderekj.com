import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = CollectionEntry<'projects'>['data']['status'];

/** User-facing labels (internal schema still uses active / paused / retired). */
export function displayProjectStatus(status: ProjectStatus): string {
  if (status === 'active') return 'Front Burner';
  if (status === 'paused') return 'Back Burner';
  return status;
}
