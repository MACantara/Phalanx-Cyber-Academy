import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: './openapi.json',
    output: {
      target: './src/lib/generated/api.ts',
      client: 'axios',
      override: {
        mutator: { path: './src/lib/api-mutator.ts', name: 'customInstance' },
      },
    },
  },
});
