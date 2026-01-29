'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image, Video, Loader2 } from 'lucide-react'

interface AddMilestoneProps {
  onSuccess: () => void
}

const categories = [
  { value: 'first', label: '第一次' },
  { value: 'health', label: '健康' },
  { value: 'education', label: '教育' },
  { value: 'play', label: '玩耍' },
  { value: 'travel', label: '出行' },
  { value: 'holiday', label: '节日' },
  { value: 'other', label: '其他' },
]

export default function AddMilestone({ onSuccess }: AddMilestoneProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('other')
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [fileTypes, setFileTypes] = useState<string[]>([])
  const supabase = createClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, 9) // 最多9个文件
    setFiles(newFiles)

    const newPreviews: string[] = []
    const newTypes: string[] = []

    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('video/')) {
        newTypes.push('video')
        newPreviews.push(URL.createObjectURL(file))
      } else {
        newTypes.push('image')
        newPreviews.push(URL.createObjectURL(file))
      }
    })

    setPreviews([...previews, ...newPreviews])
    setFileTypes([...fileTypes, ...newTypes])
  }, [files, previews, fileTypes])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 9,
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
    setFileTypes(fileTypes.filter((_, i) => i !== index))
  }

  const uploadFiles = async (): Promise<{ urls: string[]; types: string[] } | null> => {
    if (files.length === 0) return null

    setUploading(true)
    const urls: string[] = []
    const types: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileType = file.type.startsWith('video/') ? 'videos' : 'photos'
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${i}.${ext}`

      const { data, error } = await supabase.storage
        .from(fileType)
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error)
        setUploading(false)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from(fileType)
        .getPublicUrl(fileName)

      urls.push(publicUrl)
      types.push(file.type.startsWith('video/') ? 'video' : 'image')
    }

    setUploading(false)
    return { urls, types }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('请输入标题')
      return
    }

    const uploadResult = await uploadFiles()

    const { error } = await supabase.from('milestones').insert({
      title,
      description,
      date,
      category,
      media_urls: uploadResult?.urls || [],
      media_types: uploadResult?.types || [],
      likes: 0,
    })

    if (error) {
      alert('保存失败: ' + error.message)
      return
    }

    // 重置表单
    setTitle('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('other')
    setFiles([])
    setPreviews([])
    setFileTypes([])

    onSuccess()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">添加新记录</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：第一次叫爸爸"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  category === cat.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="记录这一刻的特别之处..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 文件上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            照片/视频 (最多9个)
          </label>
          
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            {isDragActive ? (
              <p className="text-primary-500">放下文件...</p>
            ) : (
              <>
                <p className="text-gray-600">拖拽文件到此处，或点击选择</p>
                <p className="text-sm text-gray-400 mt-1">支持 JPG, PNG, GIF, WEBP, MP4, WEBM, MOV</p>
              </>
            )}
          </div>

          {/* 预览 */}
          {previews.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {fileTypes[index] === 'video' ? (
                    <video src={preview} className="w-24 h-24 object-cover rounded-lg" />
                  ) : (
                    <img src={preview} alt={`预览 ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                  {fileTypes[index] === 'video' && (
                    <Video size={16} className="absolute bottom-2 left-2 text-white" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={uploading || !title.trim()}
          className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              上传中...
            </>
          ) : (
            '保存记录'
          )}
        </button>
      </form>
    </div>
  )
}
