import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { slugField } from 'payload'

export const Departments: CollectionConfig = {
  slug: 'departments',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'faculty', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'faculty',
      type: 'relationship',
      relationTo: 'faculties',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'head',
      type: 'relationship',
      relationTo: 'faculty-members' as any,
      label: 'Заведующий кафедрой',
      admin: { position: 'sidebar' },
    },
    {
      name: 'email',
      type: 'email',
      admin: { position: 'sidebar' },
    },
    {
      name: 'phone',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
