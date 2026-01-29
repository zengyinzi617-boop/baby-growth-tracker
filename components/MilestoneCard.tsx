'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/utils/supabase/database.types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Heart, MessageCircle, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import Comments from './Comments'

type Milestone = Database['public']['Tables']['milestones']['Row']

interface MilestoneCardProps {
  milestone: Milestone
  age: string
  onUpdate: () => void
}

const categoryEmojis: Record<string, string> = {
  first: '🌟',
  health: '💪',
  education: '📚',
  play: '🎉',
  travel: '✈️',
  holiday: '🎄',
  other: '📝',
}

export default function MilestoneCard({ milestone, age, onUpdate }: MilestoneCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    const { error } = await supabase
      .from('milestones')
      .update({ likes: milestone.likes + 1 })
      .eq('id', milestone.id)

    if (!error) {
      onUpdate()
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这条记录吗？')) return

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestone.id)

    if (!error) {
      onUpdate()
    }
  }

  const handleEdit = async () => {
    const newTitle = prompt('修改标题:', milestone.title)
    if (newTitle === null) return

    const { error } = await supabase
      .from('milestones')
      .update({ title: newTitle })
      .eq('id', milestone.id)

    if (!error) {
      onUpdate()
      setIsEditing(false)
    }
  }

  return (
    <div className="milestone-card bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* 头部 */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryEmojis[milestone.category] || '📝'}</span>
            <div>
              <h3 className="font-semibold text-gray-800">
                {isEditing ? (
                  <input
                    className="border rounded px-2 py-1"
                    defaultValue={milestone.title}
                    onBlur={(e) => {
                      if (e.target.value !== milestone.title) {
                        supabase.from('milestones').update({ title: e.target.value }).eq('id', milestone.id).then(onUpdate)
                      }
                      setIsEditing(false)
                    }}
                    autoFocus
                  />
                ) : (
                  milestone.title
                )}
              </h3>
              <p className="text-sm text-gray-500">
                {format(new Date(milestone.date), 'yyyy年M月d日', { locale: zhCN })} · {age}
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical size={20} className="text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 size={16} /> 编辑
                </button>
                <button
                  onClick={() => {
                    handleDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-500"
                >
                  <Trash2 size={16} /> 删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 媒体 */}
      {milestone.media_urls && milestone.media_urls.length > 0 && (
        <div className={`px-4 ${milestone.media_urls.length > 1 ? 'flex gap-2 overflow-x-auto pb-2' : ''}`}>
          {milestone.media_urls.map((url, index) => (
            milestone.media_types?.[index] === 'video' ? (
              <video
                key={index}
                src={url}
                className="rounded-lg max-h-64 object-cover flex-shrink-0"
                controls
              />
            ) : (
              <img
                key={index}
                src={url}
                alt={`${milestone.title} - ${index + 1}`}
                className="rounded-lg max-h-64 object-cover flex-shrink-0"
              />
            )
          ))}
        </div>
      )}

      {/* 描述 */}
      {milestone.description && (
        <p className="px-4 py-3 text-gray-600">{milestone.description}</p>
      )}

      {/* 操作栏 */}
      <div className="px-4 py-2 border-t flex items-center gap-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
        >
          <Heart size={20} className={milestone.likes > 0 ? 'fill-red-500 text-red-500' : ''} />
          <span className="text-sm">{milestone.likes}</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-gray-500 hover:text-primary-500 transition-colors"
        >
          <MessageCircle size={20} />
          <span className="text-sm">评论</span>
        </button>
      </div>

      {/* 评论 */}
      {showComments && (
        <div className="px-4 pb-4">
          <Comments milestoneId={milestone.id} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}
