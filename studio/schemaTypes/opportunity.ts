import {defineField, defineType} from 'sanity'

export const opportunity = defineType({
  name: 'opportunity',
  title: 'Opportunity',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Opportunity title', type: 'string', validation: rule => rule.required().max(140)}),
    defineField({name: 'company', title: 'Company', type: 'string', validation: rule => rule.required().max(100)}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4, validation: rule => rule.required().max(600)}),
    defineField({name: 'url', title: 'Application URL', type: 'url', validation: rule => rule.required().uri({scheme: ['https', 'http']})}),
    defineField({name: 'location', title: 'Applicant location', type: 'string', options: {list: ['Pakistan', 'Worldwide']}, validation: rule => rule.required()}),
    defineField({name: 'workMode', title: 'Work mode', type: 'string', options: {list: ['Remote', 'On-site / hybrid']}}),
    defineField({name: 'type', title: 'Opportunity type', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'experience', title: 'Experience', type: 'string', options: {list: ['Internship', 'Entry level', 'Junior', 'Any experience']}}),
    defineField({name: 'domain', title: 'Domain', type: 'string', options: {list: ['Frontend', 'Backend', 'Mobile', 'AI & data', 'Design', 'DevOps & cloud', 'General tech']}}),
    defineField({name: 'skills', title: 'Skills', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'salary', title: 'Salary', type: 'string'}),
    defineField({name: 'source', title: 'Source', type: 'string', readOnly: true}),
    defineField({name: 'externalId', title: 'Source ID', type: 'string', readOnly: true, hidden: true}),
    defineField({name: 'publishedAt', title: 'Published', type: 'datetime', validation: rule => rule.required()}),
    defineField({name: 'expiresAt', title: 'Expires', type: 'datetime'}),
    defineField({name: 'lastSeenAt', title: 'Last synced', type: 'datetime', readOnly: true}),
  ],
  preview: {select: {title: 'title', subtitle: 'company'}},
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: 'publishedAt', direction: 'desc'}]}],
})
