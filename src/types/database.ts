// types/database.ts
// Supabase database types with strict schema adherence for @supabase/supabase-js v2

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string
          avatar_url?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          id: string
          title: string
          emoji: string
          description: string | null
          created_by: string
          assigned_to: string | null
          mission_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          emoji?: string
          description?: string | null
          created_by: string
          assigned_to?: string | null
          mission_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          emoji?: string
          description?: string | null
          created_by?: string
          assigned_to?: string | null
          mission_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_completions: {
        Row: {
          id: string
          mission_id: string
          user_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          mission_id: string
          user_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          mission_id?: string
          user_id?: string
          completed_at?: string
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          id: string
          user_id: string
          activity_date: string
          login_completed: boolean
          all_missions_completed: boolean
          login_streak: number
          coding_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_date: string
          login_completed?: boolean
          all_missions_completed?: boolean
          login_streak?: number
          coding_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_date?: string
          login_completed?: boolean
          all_missions_completed?: boolean
          login_streak?: number
          coding_streak?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          activity_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          activity_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string
          activity_date?: string
          created_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_name: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_name: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_name?: string
          unlocked_at?: string
        }
        Relationships: []
      }
      allowed_emails: {
        Row: { email: string }
        Insert: { email: string }
        Update: { email: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      record_login_and_update_streak: {
        Args: { p_user_id: string; p_today: string }
        Returns: Json
      }
      award_daily_xp_if_complete: {
        Args: { p_user_id: string; p_date: string }
        Returns: Json
      }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: void
      }
      get_user_total_xp: {
        Args: { p_user_id: string }
        Returns: number
      }
      is_allowed_user: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Mission = Database['public']['Tables']['missions']['Row']
export type MissionCompletion = Database['public']['Tables']['mission_completions']['Row']
export type DailyActivity = Database['public']['Tables']['daily_activity']['Row']
export type XpTransaction = Database['public']['Tables']['xp_transactions']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']

// Extended types with joins
export interface MissionWithCompletion extends Mission {
  is_completed: boolean
  completed_at?: string
}

export interface MissionWithDetails extends Mission {
  creator: Profile | null
  assignee: Profile | null
  completions: MissionCompletion[]
}

export type BadgeName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

export const BADGE_THRESHOLDS: Record<BadgeName, number> = {
  Bronze: 150,
  Silver: 350,
  Gold: 500,
  Platinum: 750,
  Diamond: 1000,
}

export const BADGE_EMOJIS: Record<BadgeName, string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '💠',
}
