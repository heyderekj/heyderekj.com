import { defineConfig } from 'astro/config';
import rehypeImgCdn from './src/lib/rehype-img-cdn.ts';

export default defineConfig({
  site: 'https://heyderekj.com',
  redirects: {
    '/uses': '/tools',
    '/uses/': '/tools/',
  },
  integrations: [],
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
