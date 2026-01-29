import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 开始设置数据库...')

  // 创建 milestones 表
  const { error: milestonesError } = await supabase.from('milestones').select('id').limit(1).catch(() => ({ error: { message: 'table not exists' } }))
  
  if (milestonesError?.message === 'table not exists' || milestonesError?.message?.includes('relation "milestones" does not exist')) {
    console.log('📝 创建 milestones 表...')
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        title TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        media_urls TEXT[] DEFAULT '{}',
        media_types TEXT[] DEFAULT '{}',
        likes INTEGER DEFAULT 0
      )
    `)
  }

  // 创建 comments 表
  const { error: commentsError } = await supabase.from('comments').select('id').limit(1).catch(() => ({ error: { message: 'table not exists' } }))
  
  if (commentsError?.message === 'table not exists' || commentsError?.message?.includes('relation "comments" does not exist')) {
    console.log('📝 创建 comments 表...')
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author_name TEXT NOT NULL DEFAULT '匿名'
      )
    `)
  }

  // 创建 albums 表
  const { error: albumsError } = await supabase.from('albums').select('id').limit(1).catch(() => ({ error: { message: 'table not exists' } }))
  
  if (albumsError?.message === 'table not exists' || albumsError?.message?.includes('relation "albums" does not exist')) {
    console.log('📝 创建 albums 表...')
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS albums (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        name TEXT NOT NULL,
        description TEXT,
        cover_image TEXT
      )
    `)
  }

  // 创建 album_items 表
  const { error: albumItemsError } = await supabase.from('album_items').select('id').limit(1).catch(() => ({ error: { message: 'table not exists' } }))
  
  if (albumItemsError?.message === 'table not exists' || albumItemsError?.message?.includes('relation "album_items" does not exist')) {
    console.log('📝 创建 album_items 表...')
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS album_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
        media_url TEXT NOT NULL,
        media_type TEXT NOT NULL,
        caption TEXT
      )
    `)
  }

  // 创建存储桶
  console.log('📝 创建存储桶...')
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketNames = ['photos', 'videos']
  
  for (const bucketName of bucketNames) {
    const exists = buckets?.find(b => b.name === bucketName)
    if (!exists) {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: bucketName === 'photos' 
          ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          : ['video/mp4', 'video/webm', 'video/quicktime']
      })
      console.log(`✅ 创建存储桶: ${bucketName}`)
    }
  }

  // 设置存储桶策略（公开访问）
  console.log('📝 设置存储策略...')
  for (const bucketName of bucketNames) {
    await supabase.query(`
      CREATE POLICY IF NOT EXISTS "Allow public access" ON storage.objects
      FOR SELECT USING ( bucket_id = '${bucketName}' )
    `)
    await supabase.query(`
      CREATE POLICY IF NOT EXISTS "Allow authenticated upload" ON storage.objects
      FOR INSERT WITH CHECK ( bucket_id = '${bucketName}' AND auth.role() = 'authenticated' )
    `)
  }

  console.log('✅ 数据库设置完成！')
}

setupDatabase().catch(console.error)
