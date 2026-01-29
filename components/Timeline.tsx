'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import MilestoneCard from './MilestoneCard'
import { Database } from '@/utils/supabase/database.types'

type Milestone = Database['public']['Tables']['milestones']['Row']

interface TimelineProps {
  babyBirthday: string
}

export default function Timeline({ babyBirthday }: TimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('date', { ascending: false })

    if (data) {
      setMilestones(data)
    }
    setLoading(false)
  }

  const calculateAge = (date: string) => {
    const birthDate = new Date(babyBirthday)
    const targetDate = new Date(date)
    const years = differenceInYears(targetDate, birthDate)
    const months = differenceInMonths(targetDate, birthDate) % 12
    const days = differenceInDays(targetDate, birthDate) % 30

    const parts = []
    if (years > 0) parts.push(`${years}岁`)
    if (months > 0) parts.push(`${months}个月`)
    if (days > 0 && years === 0) parts.push(`${days}天`)

    return parts.join(' ') || '当天'
  }

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'first', label: '第一次' },
    { value: 'health', label: '健康' },
    { value: 'education', label: '教育' },
    { value: 'play', label: '玩耍' },
    { value: 'travel', label: '出行' },
    { value: 'holiday', label: '节日' },
    { value: 'other', label: '其他' },
  ]

  const filteredMilestones = filter === 'all' 
    ? milestones 
    : milestones.filter(m => m.category === filter)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 分类筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              filter === cat.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border hover:border-primary-500'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-primary-500">{milestones.length}</p>
            <p className="text-sm text-gray-500">总记录</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-500">
              {milestones.filter(m => m.media_urls && m.media_urls.length > 0).length}
            </p>
            <p className="text-sm text-gray-500">有照片/视频</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-500">
              {milestones.reduce((acc, m) => acc + m.likes, 0)}
            </p>
            <p className="text-sm text-gray-500">收获点赞</p>
          </div>
        </div>
      </div>

      {/* 时间线 */}
      <div className="relative">
        {filteredMilestones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-6xl mb-4">📝</p>
            <p>还没有记录</p>
            <p className="text-sm">点击下方「添加记录」开始吧！</p>
          </div>
        ) : (
          filteredMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              age={calculateAge(milestone.date)}
              onUpdate={fetchMilestones}
            />
          ))
        )}
      </div>
    </div>
  )
}
