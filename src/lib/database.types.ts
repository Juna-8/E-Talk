// =============================================
// Supabase Database 타입 (수동 정의 — supabase/migrations 기준)
// =============================================

import type { EventCategory, EventStatus } from '@/types'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nickname: string
          major: string | null
          grade: number | null
          interests: string[]
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          nickname?: string
          major?: string | null
          grade?: number | null
          interests?: string[]
          is_admin?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          category: EventCategory
          description: string
          date: string | null
          start_time: string | null
          end_time: string | null
          location: string | null
          host: string
          apply_url: string | null
          poster_url: string | null
          tags: string[]
          target: string | null
          notes: string | null
          status: EventStatus
          created_by: string | null
          source: string | null
          source_url: string | null
          source_article_no: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: EventCategory
          description: string
          date?: string | null
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          host: string
          apply_url?: string | null
          poster_url?: string | null
          tags?: string[]
          target?: string | null
          notes?: string | null
          status?: EventStatus
          created_by?: string | null
          source?: string | null
          source_url?: string | null
          source_article_no?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'events_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          event_id: string
          user_id: string
          content: string
          like_count: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          content: string
          like_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'reviews_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      review_likes: {
        Row: {
          review_id: string
          user_id: string
        }
        Insert: {
          review_id: string
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['review_likes']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'review_likes_review_id_fkey'
            columns: ['review_id']
            isOneToOne: false
            referencedRelation: 'reviews'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'review_likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      bookmarks: {
        Row: {
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          event_id: string
          user_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'bookmarks_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookmarks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
