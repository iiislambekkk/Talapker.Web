import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Documents: CollectionConfig = {
  slug: 'documents',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  upload: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Учебные планы', value: 'curriculum' },
        { label: 'Приказы', value: 'orders' },
        { label: 'Для абитуриентов', value: 'admissions' },
        { label: 'Нормативные документы', value: 'regulatory' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
