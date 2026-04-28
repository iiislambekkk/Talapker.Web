import type { Block } from 'payload'

export const DocumentBlock: Block = {
  slug: 'documentBlock',
  labels: { singular: 'Документ', plural: 'Документы' },
  fields: [
    {
      name: 'document',
      type: 'upload',
      relationTo: 'documents',
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      label: 'Подпись (необязательно)',
    },
  ],
}
