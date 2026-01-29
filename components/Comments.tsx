'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/utils/supabase/database.types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Send, User } from 'lucide-react'

type Comment = Database['public']['Tables']['comments']['Row']

interface CommentsProps {
  milestoneId: string
  onUpdate: () => void
}

export default function Comments({ milestoneId, onUpdate }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchComments()
  }, [milestoneId])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('milestone_id', milestoneId)
      .order('created_at', { ascending: true })

    if (data) {
      setComments(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    const { error } = await supabase.from('comments').insert({
      milestone_id: milestoneId,
      content: newComment,
      author_name: authorName.trim() || '匿名',
    })

    if (!error) {
      setNewComment('')
      fetchComments()
      onUpdate()
    }
  }

  return (
    <div className="space-y-3">
      {/* 评论列表 */}
      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-gray-400" />
                <span className="font-medium text-sm text-gray-700">{comment.author_name}</span>
                <span className="text-xs text-gray-400">
                  {format(new Date(comment.created_at), 'M月d日 H:mm', { locale: zhCN })}
                </span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 添加评论 */}
      <form onSubmit={handleSubmit} className="border-t pt-3">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="你的名字"
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="添加评论..."
            className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
