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
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'STAFF' | 'MANAGER' | 'ADMIN'
          manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'STAFF' | 'MANAGER' | 'ADMIN'
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'STAFF' | 'MANAGER' | 'ADMIN'
          manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: number
          user_id: string
          start_time: string
          end_time: string | null
          start_coordinates: Json
          end_coordinates: Json | null
          verified_km: number
          status: 'active' | 'completed'
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          start_time?: string
          end_time?: string | null
          start_coordinates: Json
          end_coordinates?: Json | null
          verified_km?: number
          status?: 'active' | 'completed'
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          start_time?: string
          end_time?: string | null
          start_coordinates?: Json
          end_coordinates?: Json | null
          verified_km?: number
          status?: 'active' | 'completed'
          created_at?: string
        }
      }
      gps_logs: {
        Row: {
          id: number
          attendance_id: number
          timestamp: string
          coordinates: Json
          created_at: string
        }
        Insert: {
          id?: number
          attendance_id: number
          timestamp?: string
          coordinates: Json
          created_at?: string
        }
        Update: {
          id?: number
          attendance_id?: number
          timestamp?: string
          coordinates?: Json
          created_at?: string
        }
      }
      doctors: {
        Row: {
          id: number
          name: string
          specialty: string | null
          registered_location: Json
          address: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          specialty?: string | null
          registered_location: Json
          address?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          specialty?: string | null
          registered_location?: Json
          address?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          price: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          price: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visits: {
        Row: {
          id: number
          user_id: string
          doctor_id: number
          attendance_id: number | null
          check_in_time: string
          check_out_time: string | null
          check_in_coordinates: Json
          check_out_coordinates: Json | null
          visit_flag: 'In Range' | 'Out of Range'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          doctor_id: number
          attendance_id?: number | null
          check_in_time?: string
          check_out_time?: string | null
          check_in_coordinates: Json
          check_out_coordinates?: Json | null
          visit_flag?: 'In Range' | 'Out of Range'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          doctor_id?: number
          attendance_id?: number | null
          check_in_time?: string
          check_out_time?: string | null
          check_in_coordinates?: Json
          check_out_coordinates?: Json | null
          visit_flag?: 'In Range' | 'Out of Range'
          notes?: string | null
          created_at?: string
        }
      }
      pob: {
        Row: {
          id: number
          visit_id: number
          product_id: number
          quantity: number
          price_per_unit: number
          total_price: number
          stockist_name: string | null
          created_at: string
        }
        Insert: {
          id?: number
          visit_id: number
          product_id: number
          quantity: number
          price_per_unit: number
          stockist_name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          visit_id?: number
          product_id?: number
          quantity?: number
          price_per_unit?: number
          stockist_name?: string | null
          created_at?: string
        }
      }
      collections: {
        Row: {
          id: number
          visit_id: number
          amount: number
          mode: 'Cash' | 'Cheque' | 'UPI' | 'NEFT' | 'RTGS'
          reference: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          visit_id: number
          amount: number
          mode: 'Cash' | 'Cheque' | 'UPI' | 'NEFT' | 'RTGS'
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          visit_id?: number
          amount?: number
          mode?: 'Cash' | 'Cheque' | 'UPI' | 'NEFT' | 'RTGS'
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: number
          user_id: string
          attendance_id: number | null
          type: 'Travel' | 'Hotel' | 'Food' | 'Other'
          amount: number
          status: 'Pending' | 'Approved' | 'Rejected'
          date: string
          verified_km: number | null
          receipt_url: string | null
          notes: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          attendance_id?: number | null
          type: 'Travel' | 'Hotel' | 'Food' | 'Other'
          amount: number
          status?: 'Pending' | 'Approved' | 'Rejected'
          date?: string
          verified_km?: number | null
          receipt_url?: string | null
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          attendance_id?: number | null
          type?: 'Travel' | 'Hotel' | 'Food' | 'Other'
          amount?: number
          status?: 'Pending' | 'Approved' | 'Rejected'
          date?: string
          verified_km?: number | null
          receipt_url?: string | null
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
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
