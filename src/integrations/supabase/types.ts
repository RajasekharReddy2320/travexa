export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          arrival_date: string | null
          arrival_time: string | null
          booking_details: Json | null
          booking_reference: string
          booking_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          class_type: string | null
          created_at: string
          departure_date: string
          departure_time: string
          from_location: string
          id: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          payment_id: string | null
          payment_status: string
          price_inr: number
          qr_code: string | null
          seat_number: string | null
          service_name: string
          service_number: string
          status: string
          to_location: string
          trip_group_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arrival_date?: string | null
          arrival_time?: string | null
          booking_details?: Json | null
          booking_reference: string
          booking_type: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          class_type?: string | null
          created_at?: string
          departure_date: string
          departure_time: string
          from_location: string
          id?: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          payment_id?: string | null
          payment_status?: string
          price_inr: number
          qr_code?: string | null
          seat_number?: string | null
          service_name: string
          service_number: string
          status?: string
          to_location: string
          trip_group_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arrival_date?: string | null
          arrival_time?: string | null
          booking_details?: Json | null
          booking_reference?: string
          booking_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          class_type?: string | null
          created_at?: string
          departure_date?: string
          departure_time?: string
          from_location?: string
          id?: string
          passenger_email?: string
          passenger_name?: string
          passenger_phone?: string
          payment_id?: string | null
          payment_status?: string
          price_inr?: number
          qr_code?: string | null
          seat_number?: string | null
          service_name?: string
          service_number?: string
          status?: string
          to_location?: string
          trip_group_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bucket_list: {
        Row: {
          created_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bucket_list_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          budget_range: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          gender: string | null
          home_location: string | null
          id: string
          interests: string[] | null
          is_public: boolean | null
          languages_spoken: string[] | null
          onboarding_completed: boolean | null
          phone: string | null
          state: string | null
          travel_preferences: string[] | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          budget_range?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          home_location?: string | null
          id: string
          interests?: string[] | null
          is_public?: boolean | null
          languages_spoken?: string[] | null
          onboarding_completed?: boolean | null
          phone?: string | null
          state?: string | null
          travel_preferences?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          budget_range?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          home_location?: string | null
          id?: string
          interests?: string[] | null
          is_public?: boolean | null
          languages_spoken?: string[] | null
          onboarding_completed?: boolean | null
          phone?: string | null
          state?: string | null
          travel_preferences?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_verifications: {
        Row: {
          booking_id: string
          id: string
          verification_location: string | null
          verified_at: string
          verified_by: string | null
        }
        Insert: {
          booking_id: string
          id?: string
          verification_location?: string | null
          verified_at?: string
          verified_by?: string | null
        }
        Update: {
          booking_id?: string
          id?: string
          verification_location?: string | null
          verified_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_verifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_likes: {
        Row: {
          created_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_likes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_segments: {
        Row: {
          arrival_time: string
          booking_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          class_type: string | null
          created_at: string | null
          departure_date: string
          departure_time: string
          from_location: string
          id: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          payment_status: string
          price_inr: number
          seat_number: string | null
          segment_order: number
          service_name: string
          service_number: string
          status: string
          to_location: string
          trip_group_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arrival_time: string
          booking_type: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          class_type?: string | null
          created_at?: string | null
          departure_date: string
          departure_time: string
          from_location: string
          id?: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          payment_status?: string
          price_inr: number
          seat_number?: string | null
          segment_order: number
          service_name: string
          service_number: string
          status?: string
          to_location: string
          trip_group_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arrival_time?: string
          booking_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          class_type?: string | null
          created_at?: string | null
          departure_date?: string
          departure_time?: string
          from_location?: string
          id?: string
          passenger_email?: string
          passenger_name?: string
          passenger_phone?: string
          payment_status?: string
          price_inr?: number
          seat_number?: string | null
          segment_order?: number
          service_name?: string
          service_number?: string
          status?: string
          to_location?: string
          trip_group_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          budget_inr: number | null
          created_at: string
          destination: string
          end_date: string
          group_size: number | null
          id: string
          image_url: string | null
          interests: string[] | null
          is_public: boolean | null
          itinerary: Json | null
          likes_count: number | null
          notes: string | null
          planner_mode: string | null
          start_date: string
          title: string
          trip_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_inr?: number | null
          created_at?: string
          destination: string
          end_date: string
          group_size?: number | null
          id?: string
          image_url?: string | null
          interests?: string[] | null
          is_public?: boolean | null
          itinerary?: Json | null
          likes_count?: number | null
          notes?: string | null
          planner_mode?: string | null
          start_date: string
          title: string
          trip_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_inr?: number | null
          created_at?: string
          destination?: string
          end_date?: string
          group_size?: number | null
          id?: string
          image_url?: string | null
          interests?: string[] | null
          is_public?: boolean | null
          itinerary?: Json | null
          likes_count?: number | null
          notes?: string | null
          planner_mode?: string | null
          start_date?: string
          title?: string
          trip_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      are_users_connected: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      get_connection_status: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
