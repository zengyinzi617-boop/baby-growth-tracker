'use client'

import { useState } from 'react'
import Timeline from './Timeline'
import AddMilestone from './AddMilestone'
import Albums from './Albums'
import { Baby, Heart, Calendar, Image } from 'lucide-react'

type Tab = 'timeline' | 'albums' | 'add'

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('timeline')
  const [babyBirthday, setBabyBirthday] = useState<string>('2024-01-01')

  const tabs = [
    { id: 'timeline' as Tab, label: '时间线', icon: Calendar },
    { id: 'albums' as Tab, label: '相册', icon: Image },
    { id: 'add' as Tab, label: '添加记录', icon: Baby },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👶</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Baby Growth Tracker</h1>
              <p className="text-sm text-gray-500">记录每一刻美好</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👶 出生日期:</span>
            <input
              type="date"
              value={babyBirthday}
              onChange={(e) => setBabyBirthday(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'timeline' && <Timeline babyBirthday={babyBirthday} />}
        {activeTab === 'albums' && <Albums />}
        {activeTab === 'add' && <AddMilestone onSuccess={() => setActiveTab('timeline')} />}
      </main>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-500 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={24} />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
