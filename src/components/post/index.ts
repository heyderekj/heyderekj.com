/**
 * Components available inside `.mdx` posts without importing them.
 * Passed to `<Content components={postComponents} />` on the post page.
 * Catalog + examples: docs/CONTENT_WORKFLOW.md.
 */
import Appendix from './Appendix.astro';
import Callout from './Callout.astro';
import Clip from './Clip.astro';
import Compare from './Compare.astro';
import Figure from './Figure.astro';
import FigSameList from './FigSameList.astro';
import FigSidebarDesk from './FigSidebarDesk.astro';
import Prompt from './Prompt.astro';
import Sidenote from './Sidenote.astro';
import Snapshots from './Snapshots.astro';

export const postComponents = {
  Appendix,
  Callout,
  Clip,
  Compare,
  Figure,
  FigSameList,
  FigSidebarDesk,
  Prompt,
  Sidenote,
  Snapshots,
};
