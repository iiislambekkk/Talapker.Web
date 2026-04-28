import type { GlobalConfig } from 'payload'
import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Навигация',
          fields: [
            {
              name: 'navItems',
              type: 'array',
              localized: true,
              fields: [
                link({ appearances: false }),
              ],
            },
          ],
        },
        {
          label: 'Соцсети',
          fields: [
            {
              name: 'socials',
              type: 'array',
              fields: [
                { name: 'url', type: 'text', required: true },
                { name: 'platform', type: 'select', options: ['facebook', 'instagram', 'youtube', 'vk'], required: true },
              ],
            },
          ],
        },
        {
          label: 'Контент',
          fields: [
            { name: 'copyright', type: 'text', localized: true },
            { name: 'locationText', type: 'text', localized: true },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
