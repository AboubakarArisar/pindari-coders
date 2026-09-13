import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {resource} from './schemaTypes/resource'
import {opportunity} from './schemaTypes/opportunity'

export default defineConfig({
  name: 'pindaricoders',
  title: 'PindariCoders — Content',
  projectId: 'uffqpes0',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {types: [resource, opportunity]},
})
