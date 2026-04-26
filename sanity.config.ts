import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'e04vq9dw';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'directkey',
  title: 'DirectKey CMS',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
  basePath: '/studio',
});
