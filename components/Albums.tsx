'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/utils/supabase/database.types'
import { Plus, Trash2, Edit2, X, Image, Video } from 'lucide-react'

type Album = Database['public']['Tables']['albums']['Row']
type AlbumItem = Database['public']['Tables']['album_items']['Row']

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [albumItems, setAlbumItems] = useState<AlbumItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [newAlbumDesc, setNewAlbumDesc] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    const { data } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setAlbums(data)
    }
    setLoading(false)
  }

  const fetchAlbumItems = async (album: Album) => {
    setSelectedAlbum(album)
    const { data } = await supabase
      .from('album_items')
      .select('*')
      .eq('album_id', album.id)
      .order('created_at', { ascending: false })

    if (data) {
      setAlbumItems(data)
    }
  }

  const createAlbum = async () => {
    if (!newAlbumName.trim()) return

    const { data, error } = await supabase
      .from('albums')
      .insert({
        name: newAlbumName,
        description: newAlbumDesc,
      })
      .select()
      .single()

    if (!error && data) {
      setAlbums([data, ...albums])
      setShowCreateModal(false)
      setNewAlbumName('')
      setNewAlbumDesc('')
    }
  }

  const deleteAlbum = async (albumId: string) => {
    if (!confirm('确定要删除这个相册吗？')) return

    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId)

    if (!error) {
      setAlbums(albums.filter(a => a.id !== albumId))
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // 显示相册详情
  if (selectedAlbum) {
    return (
      <div>
        <button
          onClick={() => setSelectedAlbum(null)}
          className="mb-4 text-primary-500 hover:underline"
        >
          ← 返回相册列表
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedAlbum.name}</h2>
        
        {selectedAlbum.description && (
          <p className="text-gray-600 mb-4">{selectedAlbum.description}</p>
        )}

        {albumItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-6xl mb-4">📂</p>
            <p>这个相册还没有照片</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {albumItems.map((item) => (
              <div key={item.id} className="aspect-square relative group">
                {item.media_type === 'video' ? (
                  <video src={item.media_url} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <img src={item.media_url} alt={item.caption || ''} className="w-full h-full object-cover rounded-lg" />
                )}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 显示相册列表
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">相册</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          <Plus size={18} />
          新建相册
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-6xl mb-4">📁</p>
          <p>还没有相册</p>
          <p className="text-sm mt-2">点击「新建相册」开始整理照片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => fetchAlbumItems(album)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {album.cover_image ? (
                  <img src={album.cover_image} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <Image size={48} className="text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 truncate">{album.name}</h3>
                {album.description && (
                  <p className="text-sm text-gray-500 truncate mt-1">{album.description}</p>
                )}
              </div>
              <div className="px-3 pb-3 flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteAlbum(album.id)
                  }}
                  className="text-red-500 text-sm flex items-center gap-1 hover:underline"
                >
                  <Trash2 size={14} /> 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建相册弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">新建相册</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">相册名称</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="例如：2024年1月"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
                <textarea
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="简单描述这个相册"
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <button
                onClick={createAlbum}
                disabled={!newAlbumName.trim()}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 disabled:bg-gray-300"
              >
                创建相册
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
