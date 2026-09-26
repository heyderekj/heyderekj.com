/**
 * Components available inside `.mdx` posts without importing them.
 * Passed to `<Content components={postComponents} />` on the post page.
 */
import Callout from './Callout.astro';

export const postComponents = {
  Callout,
};
