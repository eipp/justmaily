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
      companies: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          domain: string
          description: string | null
          industry: string | null
          size: string | null
          location: string | null
          founded: number | null
          employees: Json | null
          revenue: Json | null
          funding: Json | null
          technologies: string[] | null
          social: Json | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          domain: string
          description?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          founded?: number | null
          employees?: Json | null
          revenue?: Json | null
          funding?: Json | null
          technologies?: string[] | null
          social?: Json | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          domain?: string
          description?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          founded?: number | null
          employees?: Json | null
          revenue?: Json | null
          funding?: Json | null
          technologies?: string[] | null
          social?: Json | null
          metadata?: Json | null
        }
      }
      contacts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          title: string | null
          department: string | null
          company: string | null
          location: string | null
          phone: string | null
          social: Json | null
          education: Json | null
          experience: Json | null
          skills: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          title?: string | null
          department?: string | null
          company?: string | null
          location?: string | null
          phone?: string | null
          social?: Json | null
          education?: Json | null
          experience?: Json | null
          skills?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          title?: string | null
          department?: string | null
          company?: string | null
          location?: string | null
          phone?: string | null
          social?: Json | null
          education?: Json | null
          experience?: Json | null
          skills?: string[] | null
          metadata?: Json | null
        }
      }
      enrichment: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          url: string
          company_id: string | null
          contacts: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          url: string
          company_id?: string | null
          contacts?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          url?: string
          company_id?: string | null
          contacts?: string[] | null
          metadata?: Json | null
        }
      }
      rate_limits: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          key: string
          count: number
          timestamp: string
          expires_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          key: string
          count: number
          timestamp: string
          expires_at: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          key?: string
          count?: number
          timestamp?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 