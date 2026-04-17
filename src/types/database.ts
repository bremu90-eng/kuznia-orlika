export type UserRole = 'client' | 'trainer' | 'admin'
export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
export type BookingStatus = 'pending_payment' | 'confirmed' | 'cancelled_client' | 'cancelled_studio' | 'completed' | 'no_show'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled'
export type PaymentType = 'deposit_full' | 'deposit_partial' | 'full_payment'
export type DepositPolicy = 'full_100' | 'partial_25'
export type ClassCategory = 'personal' | 'duet' | 'group_small' | 'group_large'
export type RefundStatus = 'none' | 'pending' | 'issued' | 'failed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; first_name: string; last_name: string
          phone: string | null; birth_date: string | null
          role: UserRole; avatar_url: string | null
          created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      trainers: {
        Row: {
          id: string; profile_id: string | null; slug: string
          first_name: string; last_name: string; bio: string | null
          specialty: string[] | null; avatar_url: string | null
          is_active: boolean; sort_order: number
          created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['trainers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['trainers']['Insert']>
      }
      class_types: {
        Row: {
          id: string; slug: string; name: string; description: string | null
          category: ClassCategory; duration_minutes: number; max_capacity: number
          base_price: number; deposit_policy: DepositPolicy
          is_active: boolean; sort_order: number
          created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['class_types']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['class_types']['Insert']>
      }
      sessions: {
        Row: {
          id: string; class_type_id: string; trainer_id: string
          title: string | null; description: string | null
          starts_at: string; ends_at: string; max_capacity: number
          price: number; status: SessionStatus
          created_by: string | null; cancelled_reason: string | null
          created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      bookings: {
        Row: {
          id: string; session_id: string; client_id: string
          status: BookingStatus; booking_amount: number; deposit_amount: number
          refund_amount: number | null; cancellation_policy_snapshot: Record<string, unknown>
          cancellation_reason: string | null; cancelled_at: string | null
          refund_status: RefundStatus; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      payments: {
        Row: {
          id: string; booking_id: string
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          amount: number; currency: string; status: PaymentStatus
          payment_type: PaymentType; refund_status: RefundStatus
          refunded_amount: number; stripe_refund_id: string | null
          metadata: Record<string, unknown>
          created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      email_logs: {
        Row: {
          id: string; recipient: string; template: string; subject: string
          status: string; resend_id: string | null; related_id: string | null
          error_msg: string | null; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['email_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['email_logs']['Insert']>
      }
      contact_messages: {
        Row: {
          id: string; name: string; email: string; phone: string | null
          message: string; is_read: boolean; created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contact_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>
      }
    }
    Functions: {
      get_available_spots: { Args: { p_session_id: string }; Returns: number }
      create_booking_atomic: {
        Args: {
          p_session_id: string; p_client_id: string
          p_booking_amount: number; p_deposit_amount: number
          p_policy_snapshot: Record<string, unknown>
        }
        Returns: Database['public']['Tables']['bookings']['Row']
      }
      calculate_refund: { Args: { p_booking_id: string }; Returns: number }
      auth_role: { Args: Record<string, never>; Returns: UserRole }
    }
  }
}
