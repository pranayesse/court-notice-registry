'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, Download, Share2 } from 'lucide-react'

interface ShareCaseCardProps {
  slug: string
  accusedName: string
}

export default function ShareCaseCard({ slug, accusedName }: ShareCaseCardProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pendingcase.in'
  const caseUrl = `${baseUrl}/case/${slug}`

  async function copyLink() {
    await navigator.clipboard.writeText(caseUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`⚠️ Pending court case against ${accusedName}: ${caseUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  async function downloadOgImage() {
    const res = await fetch(`/api/og?slug=${slug}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `case-${slug}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={copyLink} className="gap-2">
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy link'}
      </Button>

      <Button
        variant="outline"
        onClick={shareWhatsApp}
        className="gap-2 text-green-700 border-green-300 hover:bg-green-50"
      >
        <Share2 size={16} />
        Share on WhatsApp
      </Button>

      <Button variant="outline" onClick={downloadOgImage} className="gap-2">
        <Download size={16} />
        Download notice card
      </Button>
    </div>
  )
}
