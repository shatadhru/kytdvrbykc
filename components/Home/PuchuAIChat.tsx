"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Cat,
  Send,
  X,
  Minus,
  GripHorizontal,
  MessageCircle,
  Phone,
  ArrowRight,
  Loader2,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  GraduationCap,
  BookOpen,
} from "lucide-react"

interface CourseCardItem {
  title: string
  slug: string
  image?: string
  price?: string | number
}

function parseCourseCardsAndText(rawText: string): { cleanText: string; cards: CourseCardItem[] } {
  const cards: CourseCardItem[] = []
  const cardRegex = /\[COURSE_CARD:\s*(\{.*?\})\s*\]/gi

  let match: RegExpExecArray | null
  while ((match = cardRegex.exec(rawText)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      if (parsed && (parsed.slug || parsed.title)) {
        cards.push({
          title: parsed.title || "কোর্স",
          slug: parsed.slug || "",
          image: parsed.image || "",
          price: parsed.price || "",
        })
      }
    } catch {
      // Ignore JSON parsing errors
    }
  }

  const cleanText = rawText.replace(cardRegex, "").trim()
  return { cleanText, cards }
}

function renderFormattedMessageText(text: string) {
  // Support bold **text** and markdown links [text](url)
  const segments = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g)
  return segments.map((seg, idx) => {
    if (seg.startsWith("**") && seg.endsWith("**") && seg.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {seg.slice(2, -2)}
        </strong>
      )
    }
    const linkMatch = seg.match(/^\[(.*?)\]\((.*?)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      return (
        <Link
          key={idx}
          href={href}
          className="text-red-400 underline hover:text-red-300 font-medium transition"
        >
          {label}
        </Link>
      )
    }
    return <span key={idx}>{seg}</span>
  })
}

interface Message {
  id: string
  sender: "user" | "bot"
  text: string
  time: string
}

interface AIStatus {
  enabled: boolean
  botName: string
  botSubtitle: string
  remaining: number
  dailyLimit: number
  isEnrolled: boolean
  contacts: {
    whatsapp: string
    messenger: string
  }
  limitReachedMessage: string
}

const DEFAULT_SUGGESTIONS = [
  "আমাদের কি কি কোর্স আছে? 🎓",
  "কোর্স ফি ও ভর্তি প্রক্রিয়া কী? 💳",
  "আমি কোন কোন কোর্সে ভর্তি আছি? 📚",
  "দেলোয়ার স্যারের সাথে সরাসরি যোগাযোগ কীভাবে করব? 📞",
]

export default function PuchuAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<AIStatus>({
    enabled: true,
    botName: "পুচু AI 🐱",
    botSubtitle: "দেলোয়ার স্যারের কিউট ক্যাট অ্যাসিস্ট্যান্ট 🐾",
    remaining: 3,
    dailyLimit: 3,
    isEnrolled: false,
    contacts: {
      whatsapp: "8801700000000",
      messenger: "https://m.me/uniqueteachingmethod",
    },
    limitReachedMessage: "মিউ 🐾 আজ তোমার প্রশ্ন করার দৈনিক কোটা শেষ হয়ে গেছে!",
  })

  // Draggable state for floating button
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const hasMovedRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, btnX: 0, btnY: 0 })
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize position to bottom-right corner safely on client mount
  useEffect(() => {
    setIsMounted(true)
    const initX = Math.max(16, window.innerWidth - 90)
    const initY = Math.max(16, window.innerHeight - 100)

    try {
      const savedPos = localStorage.getItem("puchu_ai_pos")
      if (savedPos) {
        const parsed = JSON.parse(savedPos)
        if (
          typeof parsed.x === "number" &&
          typeof parsed.y === "number" &&
          parsed.x > 0 &&
          parsed.x < window.innerWidth - 40 &&
          parsed.y > 0 &&
          parsed.y < window.innerHeight - 40
        ) {
          setBtnPos(parsed)
          return
        }
      }
    } catch {
      // ignore localStorage errors
    }
    setBtnPos({ x: initX, y: initY })
  }, [])

  // Fetch status on load
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/ai/chat")
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStatus({
            enabled: data.enabled !== false,
            botName: data.botName || "পুচু AI 🐱",
            botSubtitle: data.botSubtitle || "দেলোয়ার স্যারের কিউট ক্যাট অ্যাসিস্ট্যান্ট 🐾",
            remaining: typeof data.remaining === "number" ? data.remaining : 3,
            dailyLimit: typeof data.dailyLimit === "number" ? data.dailyLimit : 3,
            isEnrolled: Boolean(data.isEnrolled),
            contacts: data.contacts || {
              whatsapp: "8801700000000",
              messenger: "https://m.me/uniqueteachingmethod",
            },
            limitReachedMessage:
              data.limitReachedMessage || "মিউ 🐾 আজ তোমার প্রশ্ন করার দৈনিক কোটা শেষ হয়ে গেছে!",
          })

          // Setup initial welcome greeting if empty
          if (messages.length === 0) {
            setMessages([
              {
                id: "initial-greeting",
                sender: "bot",
                text: `স্বাগতম! 🐾 আমি ${data.botName || "পুচু AI"}, দেলোয়ার স্যারের ইউনিক টিচিং মেথডের ডিজিটাল অ্যাসিস্ট্যান্ট। কোর্স, সিলেবাস বা যেকোনো তথ্যের জন্য আমাকে জিজ্ঞেস করতে পারেন।`,
                time: new Date().toLocaleTimeString("bn-BD", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ])
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch Puchu AI status:", err)
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isLoading])

  // Dragging event handlers for the toggle button
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true
    hasMovedRef.current = false
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      btnX: btnPos.x,
      btnY: btnPos.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    if (Math.hypot(dx, dy) > 6) {
      hasMovedRef.current = true
    }

    const newX = Math.min(Math.max(12, dragStartRef.current.btnX + dx), window.innerWidth - 76)
    const newY = Math.min(Math.max(12, dragStartRef.current.btnY + dy), window.innerHeight - 76)

    setBtnPos({ x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }

    if (!hasMovedRef.current) {
      // Pure click -> Toggle open/close
      setIsOpen((prev) => !prev)
    } else {
      // Was dragged -> save position
      try {
        localStorage.setItem("puchu_ai_pos", JSON.stringify(btnPos))
      } catch {
        // ignore
      }
    }
  }

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || isLoading) return

    if (status.remaining <= 0) {
      return
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // Build history for API
    const historyPayload = messages
      .slice(-6)
      .map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }))

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      })

      const data = await res.json()

      if (data.limitReached) {
        setStatus((prev) => ({ ...prev, remaining: 0 }))
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply || status.limitReachedMessage,
          time: new Date().toLocaleTimeString("bn-BD", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setMessages((prev) => [...prev, botMsg])
      } else if (data.success && data.reply) {
        if (typeof data.remaining === "number") {
          setStatus((prev) => ({
            ...prev,
            remaining: data.remaining,
            dailyLimit: data.dailyLimit ?? prev.dailyLimit,
            isEnrolled: data.isEnrolled ?? prev.isEnrolled,
            contacts: data.contacts ?? prev.contacts,
          }))
        }
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString("bn-BD", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setMessages((prev) => [...prev, botMsg])
      } else {
        const errorText = data.reply || data.error || "মিউ 😿 একটি সমস্যা হয়েছে! অনুগ্রহ করে আবার চেষ্টা করো।"
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: errorText,
          time: new Date().toLocaleTimeString("bn-BD", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setMessages((prev) => [...prev, botMsg])
      }
    } catch {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: "মিউ 😿 নেটওয়ার্ক সমস্যা হয়েছে! দয়া করে একটু পর আবার চেষ্টা করো বা সরাসরি যোগাযোগ করো 🐾",
        time: new Date().toLocaleTimeString("bn-BD", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isMounted || !status.enabled) return null

  const cleanWhatsappNumber = status.contacts.whatsapp?.replace(/[^0-9]/g, "") || "8801700000000"
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    "আসসালামু আলাইকুম দেলোয়ার স্যার, আমি কোর্স সংক্রান্ত বিষয়ে জানতে চাই।"
  )}`
  const messengerUrl =
    status.contacts.messenger?.startsWith("http")
      ? status.contacts.messenger
      : `https://m.me/${status.contacts.messenger || "uniqueteachingmethod"}`

  // Determine chat window positioning: anchored nicely near the button
  // If button is on right half, open to the left; if on left half, open to the right.
  const isRightSide = btnPos.x > window.innerWidth / 2
  const isBottomSide = btnPos.y > window.innerHeight / 2

  return (
    <>
      {/* 1. Movable Floating Toggle Button */}
      <div
        style={{
          position: "fixed",
          left: `${btnPos.x}px`,
          top: `${btnPos.y}px`,
          zIndex: 99999,
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="group select-none cursor-grab active:cursor-grabbing transition-transform active:scale-95"
        title="পুচু AI (ড্র্যাগ করে যেকোনো জায়গায় সরান)"
      >
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-75 blur-sm animate-pulse group-hover:opacity-100 transition duration-300" />

          {/* Main button pill */}
          <div className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-neutral-950 border border-red-500/50 shadow-2xl shadow-red-950/50 text-white">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-inner">
              <Cat className="w-5 h-5 text-white animate-bounce" />
              {/* Online indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-neutral-950" />
            </div>

            <div className="flex flex-col text-left pr-1">
              <span className="text-xs font-bold leading-tight flex items-center gap-1 text-red-100">
                {status.botName}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium leading-none">
                {status.remaining > 0 ? `বাকি: ${status.remaining}টি` : "সীমা শেষ 🐾"}
              </span>
            </div>

            {/* Move indicator dots */}
            <div className="text-zinc-600 group-hover:text-zinc-400 pl-0.5">
              <GripHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Floating Chat Window Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            zIndex: 99998,
            // Responsive positioning near button
            ...(window.innerWidth < 640
              ? {
                  left: "12px",
                  right: "12px",
                  bottom: "16px",
                  maxHeight: "84vh",
                }
              : {
                  left: isRightSide
                    ? `${Math.max(16, btnPos.x - 360)}px`
                    : `${Math.min(window.innerWidth - 410, btnPos.x + 80)}px`,
                  top: isBottomSide
                    ? `${Math.max(16, btnPos.y - 530)}px`
                    : `${Math.min(window.innerHeight - 560, btnPos.y + 20)}px`,
                  width: "390px",
                  height: "530px",
                }),
          }}
          className="flex flex-col rounded-2xl bg-neutral-950/95 border border-red-900/50 shadow-2xl shadow-red-950/60 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/70 via-neutral-950 to-neutral-950 border-b border-red-950/60">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md">
                <Cat className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-neutral-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {status.botName}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/40 text-red-200 font-normal">
                    {status.isEnrolled ? "এনরোল্ড শিক্ষার্থী" : "শিক্ষার্থী"}
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400 line-clamp-1">{status.botSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Daily remaining quota badge */}
              <div
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                  status.remaining > 0
                    ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300"
                    : "bg-red-950/60 border-red-800/50 text-red-300"
                }`}
                title={`দৈনিক মোট কোটা: ${status.dailyLimit}টি`}
              >
                বাকি: {status.remaining}/{status.dailyLimit}
              </div>

              {/* Minimize / Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-neutral-800/60 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-800">
            {messages.map((m) => {
              const isUser = m.sender === "user"
              const { cleanText, cards } = isUser
                ? { cleanText: m.text, cards: [] }
                : parseCourseCardsAndText(m.text)

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed max-w-[88%] whitespace-pre-wrap break-words ${
                      isUser
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-br-none shadow-md shadow-red-950/40"
                        : "bg-neutral-900/90 text-zinc-200 border border-neutral-800/80 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {isUser ? (
                      cleanText
                    ) : (
                      <>
                        <div>{renderFormattedMessageText(cleanText)}</div>
                        {cards.length > 0 && (
                          <div className="mt-2.5 space-y-2 w-full pt-1 border-t border-neutral-800/60">
                            {cards.map((card, cIdx) => (
                              <Link
                                key={cIdx}
                                href={card.slug ? `/courses/${card.slug}` : "/courses"}
                                className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-950/90 hover:bg-neutral-900 border border-red-900/50 hover:border-red-500/70 transition-all group/card shadow-sm text-left block"
                              >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 border border-neutral-800 flex items-center justify-center">
                                  {card.image ? (
                                    <img
                                      src={card.image}
                                      alt={card.title}
                                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform"
                                      onError={(e) => {
                                        ;(e.currentTarget as HTMLElement).style.display = "none"
                                      }}
                                    />
                                  ) : null}
                                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 -z-0">
                                    <GraduationCap className="w-5 h-5 text-red-400/80" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0 pr-1">
                                  <p className="text-xs font-semibold text-white group-hover/card:text-red-300 line-clamp-1 transition-colors leading-tight">
                                    {card.title}
                                  </p>
                                  <div className="flex items-center justify-between mt-1 text-[10px]">
                                    {card.price ? (
                                      <span className="font-bold text-emerald-400">৳{card.price}</span>
                                    ) : (
                                      <span className="text-zinc-400">কোর্সের বিবরণ</span>
                                    )}
                                    <span className="text-red-400 font-medium group-hover/card:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                      কোর্স দেখুন →
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 px-1">{m.time}</span>
                </div>
              )
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs py-1.5 px-2">
                <Cat className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="italic flex items-center gap-1">
                  পুচু ভাবছে... 🐾
                  <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                </span>
              </div>
            )}

            {/* Quick Suggestions Chips (only if user hasn't asked questions yet) */}
            {messages.length <= 1 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] text-zinc-400 font-medium mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-red-400" />
                  দ্রুত প্রশ্ন বেছে নিন:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(sug)}
                      className="text-[11px] px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-red-950/50 hover:text-red-200 border border-neutral-800 hover:border-red-900/60 text-zinc-300 text-left transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quota Exceeded Card with WhatsApp & Messenger */}
            {status.remaining <= 0 && (
              <div className="mt-3 p-3.5 rounded-xl bg-red-950/30 border border-red-900/60 space-y-2.5 text-center">
                <p className="text-xs text-red-200 font-medium leading-relaxed">
                  {status.limitReachedMessage}
                </p>
                <p className="text-[11px] text-zinc-400">
                  সরাসরি দেলোয়ার স্যারের সাথে কথা বলতে নিচে ক্লিক করুন:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition shadow"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                  <a
                    href={messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Messenger
                  </a>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800/80">
            {status.remaining > 0 ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="পুচুকে কিছু জিজ্ঞেস করো... 🐱"
                  disabled={isLoading}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
                  aria-label="Send"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 py-0.5">
                <span>আজকের দৈনিক লিমিট শেষ 🐾</span>
                <div className="flex items-center gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    WhatsApp
                  </a>
                  <span className="text-zinc-600">|</span>
                  <a
                    href={messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Messenger
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
