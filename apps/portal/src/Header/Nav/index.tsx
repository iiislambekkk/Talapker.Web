'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType, locale: string }> = ({ data, locale }) => {
  return (
    <nav className="flex gap-3">
      {data.navItems?.map(({ link }, i) => (
        <CMSLink key={i} {...link} appearance="link" className={"text-white"} />
      ))}
    </nav>
  )
}
