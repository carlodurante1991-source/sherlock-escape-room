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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      game_config: {
        Row: {
          admin_email: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          admin_email: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_password: {
        Row: {
          created_at: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          created_at: string
          expires_at: string
          game_last_activity_at: string | null
          game_remaining_seconds: number | null
          game_started_at: string | null
          id: string
          is_active: boolean
          last_activity_at: string
          remaining_seconds: number
          session_token: string
          started_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          game_last_activity_at?: string | null
          game_remaining_seconds?: number | null
          game_started_at?: string | null
          id?: string
          is_active?: boolean
          last_activity_at?: string
          remaining_seconds?: number
          session_token: string
          started_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          game_last_activity_at?: string | null
          game_remaining_seconds?: number | null
          game_started_at?: string | null
          id?: string
          is_active?: boolean
          last_activity_at?: string
          remaining_seconds?: number
          session_token?: string
          started_at?: string
        }
        Relationships: []
      }
      player_passwords: {
        Row: {
          created_at: string
          game_session_id: string | null
          id: string
          is_active: boolean
          password: string
        }
        Insert: {
          created_at?: string
          game_session_id?: string | null
          id?: string
          is_active?: boolean
          password: string
        }
        Update: {
          created_at?: string
          game_session_id?: string | null
          id?: string
          is_active?: boolean
          password?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_passwords_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          completed_at: string | null
          created_at: string
          current_enigma: number | null
          current_phase: string | null
          game_session_id: string | null
          id: string
          is_connected: boolean
          last_activity_at: string
          nickname: string
          player_token: string
          room_id: string | null
          score: number
          solved_enigmas: number[] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_enigma?: number | null
          current_phase?: string | null
          game_session_id?: string | null
          id?: string
          is_connected?: boolean
          last_activity_at?: string
          nickname: string
          player_token: string
          room_id?: string | null
          score?: number
          solved_enigmas?: number[] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_enigma?: number | null
          current_phase?: string | null
          game_session_id?: string | null
          id?: string
          is_connected?: boolean
          last_activity_at?: string
          nickname?: string
          player_token?: string
          room_id?: string | null
          score?: number
          solved_enigmas?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "players_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          blocked_until: string | null
          created_at: string
          game_session_id: string | null
          id: string
          is_active: boolean
          max_players: number
          room_code: string
          room_name: string
          solved_enigmas: number[] | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          game_session_id?: string | null
          id?: string
          is_active?: boolean
          max_players?: number
          room_code: string
          room_name: string
          solved_enigmas?: number[] | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          game_session_id?: string | null
          id?: string
          is_active?: boolean
          max_players?: number
          room_code?: string
          room_name?: string
          solved_enigmas?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_random_password: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
