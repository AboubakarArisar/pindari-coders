import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {resource} from './schemaTypes/resource'

export default defineConfig({
  name: 'pindaricoders',
  title: 'PindariCoders — Resources',
  projectId: 'uffqpes0',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {types: [resource]},
})
