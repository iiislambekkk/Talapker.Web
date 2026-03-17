import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { slugField } from 'payload'

export const Specialties: CollectionConfig = {
  slug: 'specialties',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'code', 'degree'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      label: 'Код специальности',
      admin: { position: 'sidebar' },
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'degree',
      type: 'select',
      required: true,
      options: [
        { label: 'Бакалавриат', value: 'bachelor' },
        { label: 'Магистратура', value: 'master' },
        { label: 'Докторантура', value: 'phd' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'duration',
      type: 'number',
      label: 'Длительность (лет)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'form',
      type: 'select',
      label: 'Форма обучения',
      hasMany: true,
      options: [
        { label: 'Очная', value: 'full-time' },
        { label: 'Заочная', value: 'part-time' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'documents',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      label: 'Учебные планы и документы',
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
