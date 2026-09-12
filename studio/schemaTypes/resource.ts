import {defineField, defineType} from 'sanity'

export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Resource name', type: 'string', validation: rule => rule.required().min(2).max(100)}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4, description: 'Explain what this resource helps someone do.', validation: rule => rule.required().min(20).max(600)}),
    defineField({
      name: 'image', title: 'Resource image', type: 'image', options: {hotspot: true, accept: 'image/png,image/jpeg,image/webp'},
      fields: [defineField({name: 'alt', title: 'Image description', type: 'string', description: 'Describe the image for someone who cannot see it.', validation: rule => rule.required().max(180)})],
      validation: rule => rule.required().assetRequired(),
    }),
    defineField({name: 'url', title: 'Website URL', type: 'url', validation: rule => rule.required().uri({scheme: ['https', 'http']})}),
    defineField({name: 'category', title: 'Category', type: 'string', options: {list: ['AI', 'Frontend', 'Backend', 'Design', 'Algorithms', 'Developer tools', 'Learning']}, validation: rule => rule.required()}),
    defineField({name: 'pricing', title: 'Pricing', type: 'string', options: {list: ['Free', 'Freemium', 'Paid']}, validation: rule => rule.required()}),
  ],
  preview: {select: {title: 'name', subtitle: 'category', media: 'image'}},
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: '_createdAt', direction: 'desc'}]}],
})
