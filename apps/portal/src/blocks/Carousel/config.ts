import type { Block } from 'payload'
import { link } from '@/fields/link'
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

const fullRichTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
    AlignFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    HorizontalRuleFeature(),
    LinkFeature({}),
    UploadFeature(),
    FixedToolbarFeature(),
  ],
})

export const CarouselBlock: Block = {
  slug: 'carousel',
  interfaceName: 'CarouselBlock',
  fields: [
    {
      name: 'slides',
      type: 'array',
      minRows: 1,
      localized: true,
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'richText',
          type: 'richText',
          editor: fullRichTextEditor,
        },
        {
          name: 'links',
          type: 'array',
          maxRows: 2,
          fields: [link({ appearances: false })],
        },
      ],
    },
  ],
}
