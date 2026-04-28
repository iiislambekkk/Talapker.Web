import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component' // Добавлено

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  CarouselBlock as CarouselBlockProps, // Добавлено
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
  CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps | CarouselBlockProps
>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    carousel: ({ node }) => <CarouselBlock {...node.fields} />, // Добавлено
  },
})

type Props = {
  data: any
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props

  return (
    <div className={cn(
      'rich-text-container',
      {
        'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        'container': enableGutter,
      }
    )}>
      <ConvertRichText
        converters={jsxConverters}
        className={cn(
          'payload-richtext',
          '[&_.text-start]:text-left [&_.text-left]:text-left',
          '[&_.text-center]:text-center',
          '[&_.text-end]:text-right [&_.text-right]:text-right',
          '[&_.text-justify]:text-justify',
          '[&_table]:border-collapse [&_table]:w-full [&_table]:my-4',
          '[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted',
          '[&_td]:border [&_td]:border-border [&_td]:p-2',
          '[&_ul[role=list]]:list-none [&_ul[role=list]_input[type=checkbox]]:mr-2',
          className,
        )}
        {...rest}
      />
    </div>
  )
}
