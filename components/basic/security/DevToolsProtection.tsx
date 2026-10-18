'use client'

import { useEffect, useRef } from 'react'
import { authClient } from '@/payload/auth/client'
import { toast } from 'sonner'
import { useSiteSettings } from '@/components/basic/context/SiteSettingsContext'

export interface SecuritySettings {
  disableDevTools?: boolean
  disableRightClick?: boolean
  disableTextSelection?: boolean
  exemptAdmins?: boolean
  showProtectionNotice?: boolean
}

export function DevToolsProtection() {
  const { settings } = useSiteSettings()
  const security = settings?.security as SecuritySettings | undefined
  const { data: session } = authClient.useSession()
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin'
  const lastToastTime = useRef<number>(0)

  // Default active unless explicitly disabled, respecting admin exemption
  const disableDevTools = security?.disableDevTools ?? true
  const disableRightClick = security?.disableRightClick ?? true
  const disableTextSelection = security?.disableTextSelection ?? false
  const exemptAdmins = security?.exemptAdmins !== false

  useEffect(() => {
    // If exemptAdmins is enabled and user is an authenticated admin, bypass all restrictions
    if (exemptAdmins && isAdmin) {
      return
    }

    const showNotice = (msg: string) => {
      const now = Date.now()
      // Rate-limit toast to once every 2.5 seconds to prevent spam
      if (now - lastToastTime.current > 2500) {
        lastToastTime.current = now
        toast.info(msg, { duration: 2000 })
      }
    }

    // 1. Text Selection Protection (optional based on setting)
    if (disableTextSelection) {
      document.documentElement.classList.add('select-none')
    } else {
      document.documentElement.classList.remove('select-none')
    }

    // 2. Right-Click Prevention (contextmenu)
    const handleContextMenu = (e: MouseEvent) => {
      if (!disableRightClick) return

      // Preserve native context menu inside editable form elements so typing and paste works
      const target = e.target as HTMLElement | null
      if (target) {
        const tagName = target.tagName?.toLowerCase()
        if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) {
          return
        }
      }

      e.preventDefault()
      showNotice('Right-click inspection is disabled on this platform.')
    }

    // 3. DevTools Keyboard Shortcuts Prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!disableDevTools) return

      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const key = e.key?.toLowerCase()

      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault()
        e.stopPropagation()
        showNotice('Developer tools are disabled.')
        return
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect, Console, Element inspector)
      if (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        showNotice('Developer tools are disabled.')
        return
      }

      // Mac: Cmd+Option+I, Cmd+Option+J, Cmd+Option+C, Cmd+Option+U
      if (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
        showNotice('Developer tools are disabled.')
        return
      }

      // Ctrl+U (View Page Source)
      if (isCtrlOrCmd && key === 'u') {
        e.preventDefault()
        e.stopPropagation()
        showNotice('View source is disabled.')
        return
      }

      // Ctrl+S / Cmd+S (Save Page)
      if (isCtrlOrCmd && key === 's') {
        e.preventDefault()
        e.stopPropagation()
        showNotice('Saving page is disabled.')
        return
      }
    }

    // 4. Prevent drag-and-drop extraction of images / media
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName?.toLowerCase() === 'img' || target.tagName?.toLowerCase() === 'video')) {
        e.preventDefault()
      }
    }

    if (disableRightClick) {
      window.addEventListener('contextmenu', handleContextMenu, { capture: true })
    }

    if (disableDevTools) {
      window.addEventListener('keydown', handleKeyDown, { capture: true })
    }

    window.addEventListener('dragstart', handleDragStart, { capture: true })

    return () => {
      document.documentElement.classList.remove('select-none')
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true })
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('dragstart', handleDragStart, { capture: true })
    }
  }, [disableDevTools, disableRightClick, disableTextSelection, exemptAdmins, isAdmin])

  return null
}

export default DevToolsProtection
