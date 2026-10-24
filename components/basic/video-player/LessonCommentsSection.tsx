'use client'

import React, { useState, useEffect } from 'react'
import { authClient } from '@/payload/auth/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  MessageSquare,
  Reply,
  Send,
  CornerDownRight,
  User,
  Loader2,
  Clock,
} from 'lucide-react'

export interface CommentItem {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    image?: string | null
    role?: string
  }
  parentId?: string | null
  replies: CommentItem[]
}

interface LessonCommentsSectionProps {
  courseSlug: string
  lessonId: string
  lessonTitle: string
}

export function LessonCommentsSection({
  courseSlug,
  lessonId,
  lessonTitle,
}: LessonCommentsSectionProps) {
  const { data: session } = authClient.useSession()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // Fetch comments for active lesson
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    fetch(`/api/courses/${courseSlug}/lessons/${lessonId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setComments(data.comments || [])
        }
      })
      .catch((err) => {
        console.error('Failed to load comments:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [courseSlug, lessonId])

  const handlePostComment = async (parentId?: string) => {
    if (!session?.user?.id) {
      toast.error('মন্তব্য করতে অনুগ্রহ করে আগে লগইন করুন।')
      return
    }

    const textToSubmit = parentId ? replyContent : newComment
    if (!textToSubmit.trim()) {
      toast.error('অনুগ্রহ করে আপনার মন্তব্য লিখুন।')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/courses/${courseSlug}/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textToSubmit.trim(),
          parentId,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'মন্তব্য পাঠাতে সমস্যা হয়েছে।')
      }

      toast.success(parentId ? 'রিপ্লাই সফলভাবে যোগ করা হয়েছে!' : 'মন্তব্য সফলভাবে যোগ করা হয়েছে!')

      // If reply, add to parent's replies; else prepend to root comments
      if (parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...c.replies, data.comment],
              }
            }
            return c
          })
        )
        setReplyingToId(null)
        setReplyContent('')
      } else {
        setComments((prev) => [data.comment, ...prev])
        setNewComment('')
      }
    } catch (err: any) {
      toast.error(err.message || 'মন্তব্য প্রকাশ করতে ব্যর্থ হয়েছে।')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCommentDate = (dateString: string) => {
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4.5 text-primary" />
          <h3 className="font-bold text-base text-foreground">
            লেকচার আলোচনা ও প্রশ্নোত্তর ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
          {lessonTitle}
        </span>
      </div>

      {/* Main Comment Input Box */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3 shadow-xs">
        <Textarea
          placeholder={
            session
              ? 'এই লেকচার সম্পর্কিত আপনার কোনো প্রশ্ন বা মতামত থাকলে লিখুন...'
              : 'মন্তব্য করতে অনুগ্রহ করে আগে লগইন করুন...'
          }
          disabled={!session || isSubmitting}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="resize-none text-sm bg-background border-border"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {session ? `লগইন আছেন: ${session.user.name}` : 'লগইন আবশ্যক'}
          </span>
          <Button
            size="sm"
            disabled={!session || isSubmitting || !newComment.trim()}
            onClick={() => handlePostComment()}
            className="font-medium text-xs h-8 px-3 gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            মন্তব্য করুন
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span>আলোচনা লোড হচ্ছে...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-border p-6 bg-muted/10 text-muted-foreground space-y-1">
          <MessageSquare className="size-8 mx-auto opacity-30" />
          <p className="text-sm font-medium">এখনো কোনো মন্তব্য বা প্রশ্ন করা হয়নি।</p>
          <p className="text-xs">প্রথম শিক্ষার্থী হিসেবে আপনার প্রশ্ন বা মতামত শেয়ার করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {comment.author.name ? comment.author.name.charAt(0) : <User className="size-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {comment.author.name}
                      </span>
                      {comment.author.role === 'admin' ? (
                        <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary px-1.5">
                          শিক্ষক / অ্যাডমিন
                        </Badge>
                      ) : null}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReplyingToId(replyingToId === comment.id ? null : comment.id)
                  }
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Reply className="size-3.5 mr-1" />
                  {replyingToId === comment.id ? 'বাতিল' : 'উত্তর দিন'}
                </Button>
              </div>

              {/* Comment Body */}
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap pl-10">
                {comment.content}
              </p>

              {/* Reply Input Form */}
              {replyingToId === comment.id && (
                <div className="ml-10 pt-2 pl-3 border-l-2 border-primary/40 space-y-2">
                  <Textarea
                    placeholder={`@${comment.author.name} কে উত্তর দিন...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                    className="resize-none text-xs bg-background"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingToId(null)}
                      className="h-7 text-xs"
                    >
                      বাতিল
                    </Button>
                    <Button
                      size="sm"
                      disabled={isSubmitting || !replyContent.trim()}
                      onClick={() => handlePostComment(comment.id)}
                      className="h-7 text-xs gap-1"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Send className="size-3" />
                      )}
                      রিপ্লাই পাঠান
                    </Button>
                  </div>
                </div>
              )}

              {/* Threaded Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 sm:ml-10 space-y-2.5 pt-2 border-l-2 border-border/80 pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/60 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-xs text-foreground">
                          {reply.author.name}
                        </span>
                        {reply.author.role === 'admin' ? (
                          <Badge variant="secondary" className="text-[9px] h-3.5 bg-primary/10 text-primary px-1">
                            শিক্ষক
                          </Badge>
                        ) : null}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatCommentDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 pl-5 whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

