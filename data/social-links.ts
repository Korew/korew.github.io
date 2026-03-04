export type SocialIconName = `simple-icons:${string}`

export interface SocialLink {
  id: string
  label: string
  href: string
  icon: SocialIconName
}

export const socialLinks: readonly SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/korew',
    icon: 'simple-icons:github',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    href: 'https://t.me/KorenchukRoman',
    icon: 'simple-icons:telegram',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/roman-korenchuk',
    icon: 'simple-icons:linkedin',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/roman.korenchuk',
    icon: 'simple-icons:instagram',
  },
  {
    id: 'threads',
    label: 'Threads',
    href: 'https://www.threads.com/@roman.korenchuk',
    icon: 'simple-icons:threads',
  },
]
