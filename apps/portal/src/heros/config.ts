import { link } from '@/fields/link'
import type { Field } from 'payload'
import {
  AlignFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

// Максимально заряженный редактор
export const fullRichTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
    AlignFeature(), // Выравнивание
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    HorizontalRuleFeature(), // Разделитель
    LinkFeature({}),
    UploadFeature(),
    FixedToolbarFeature(), // Всегда видимая панель
  ],
})

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      options: [
        { label: 'None', value: 'none' },
        { label: 'High Impact', value: 'highImpact' },
        { label: 'Medium Impact', value: 'mediumImpact' },
        { label: 'Low Impact', value: 'lowImpact' },
        // Carousel удалена отсюда, так как теперь это блок в Layout
      ],
    },
    {
      name: 'richText',
      type: 'richText',
      editor: fullRichTextEditor, // Применяем ко всем типам Hero
      localized: true,
      admin: {
        condition: (_, { type } = {}) => type !== 'none',
      },
    },
    {
      name: 'links',
      type: 'array',
      admin: {
        condition: (_, { type } = {}) => type !== 'none',
      },
      fields: [link({ appearances: false })],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        condition: (_, { type } = {}) =>
          ['highImpact', 'mediumImpact'].includes(type),
      },
    },
  ],
}
