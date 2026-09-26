import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeImgCdn from './src/lib/rehype-img-cdn.ts';

export default defineConfig({
  site: 'https://heyderekj.com',
  redirects: {
    '/uses': '/library/tools/',
    '/uses/': '/library/tools/',
    '/tools': '/library/tools/',
    '/tools/': '/library/tools/',
    '/people': '/library/people/',
    '/people/': '/library/people/',
  },
  integrations: [mdx()],
  build: {
    format: 'directory',
  },
  markdown: {
    rehypePlugins: [rehypeImgCdn],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
