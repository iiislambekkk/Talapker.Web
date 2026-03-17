import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { slugField } from 'payload'

export const FacultyMembers: CollectionConfig = {
  slug: 'faculty-members',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'position', 'department'],
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      admin: { position: 'sidebar' },
    },
    {
      name: 'position',
      type: 'text',
      localized: true,
      label: 'Должность',
      admin: { position: 'sidebar' },
    },
    {
      name: 'academicDegree',
      type: 'select',
      label: 'Учёная степень',
      options: [
        { label: 'Кандидат наук', value: 'candidate' },
        { label: 'Доктор наук', value: 'doctor' },
        { label: 'PhD', value: 'phd' },
        { label: 'Магистр', value: 'master' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'academicTitle',
      type: 'select',
      label: 'Учёное звание',
      options: [
        { label: 'Профессор', value: 'professor' },
        { label: 'Доцент', value: 'associate' },
        { label: 'Старший преподаватель', value: 'senior' },
        { label: 'Преподаватель', value: 'lecturer' },
        { label: 'Ассистент', value: 'assistant' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
    },
    {
      name: 'email',
      type: 'email',
      admin: { position: 'sidebar' },
    },
    {
      name: 'disciplines',
      type: 'array',
      localized: true,
      label: 'Преподаваемые дисциплины',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
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
