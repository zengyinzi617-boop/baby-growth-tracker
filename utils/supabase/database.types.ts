export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      milestones: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          date: string
          category: string
          media_urls: string[] | null
          media_types: string[] | null
          likes: number
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          date: string
          category: string
          media_urls?: string[] | null
          media_types?: string[] | null
          likes?: number
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          date?: string
          category?: string
          media_urls?: string[] | null
          media_types?: string[] | null
          likes?: number
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          milestone_id: string
          content: string
          author_name: string
        }
        Insert: {
          id?: string
          created_at?: string
          milestone_id: string
          content: string
          author_name: string
        }
        Update: {
          id?: string
          created_at?: string
          milestone_id?: string
          content?: string
          author_name?: string
        }
      }
      albums: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          cover_image: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          cover_image?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          cover_image?: string | null
        }
      }
      album_items: {
        Row: {
          id: string
          created_at: string
          album_id: string
          milestone_id: string | null
          media_url: string
          media_type: string
          caption: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          album_id: string
          milestone_id?: string | null
          media_url: string
          media_type: string
          caption?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          album_id?: string
          milestone_id?: string | null
          media_url?: string
          media_type?: string
          caption?: string | null
        }
      }
    }
  }
}
