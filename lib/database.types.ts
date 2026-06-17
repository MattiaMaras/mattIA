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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          clerk_user_id: string
          content: string | null
          created_at: string
          id: string
          model_id: string | null
          model_provider: string | null
          parts: Json
          role: string
          thread_id: string
        }
        Insert: {
          clerk_user_id: string
          content?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          model_provider?: string | null
          parts?: Json
          role: string
          thread_id: string
        }
        Update: {
          clerk_user_id?: string
          content?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          model_provider?: string | null
          parts?: Json
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          archived: boolean
          clerk_user_id: string
          created_at: string
          id: string
          model_id: string | null
          model_provider: string | null
          session_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          archived?: boolean
          clerk_user_id: string
          created_at?: string
          id?: string
          model_id?: string | null
          model_provider?: string | null
          session_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          archived?: boolean
          clerk_user_id?: string
          created_at?: string
          id?: string
          model_id?: string | null
          model_provider?: string | null
          session_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          clerk_user_id: string
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json
          session_id: string
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          clerk_user_id: string
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json
          session_id: string
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          clerk_user_id?: string
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          session_id?: string
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          chunk_count: number
          clerk_user_id: string
          created_at: string
          error: string | null
          id: string
          kind: string
          mime_type: string | null
          name: string
          session_id: string
          size_bytes: number | null
          status: string
          storage_path: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          chunk_count?: number
          clerk_user_id: string
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          name: string
          session_id: string
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          chunk_count?: number
          clerk_user_id?: string
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          name?: string
          session_id?: string
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_simulations: {
        Row: {
          answers: Json
          clerk_user_id: string
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          questions: Json
          score: number | null
          session_id: string
          started_at: string | null
          status: string
          time_limit_seconds: number | null
          title: string
          topic_scores: Json
          updated_at: string
        }
        Insert: {
          answers?: Json
          clerk_user_id: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          questions?: Json
          score?: number | null
          session_id: string
          started_at?: string | null
          status?: string
          time_limit_seconds?: number | null
          title?: string
          topic_scores?: Json
          updated_at?: string
        }
        Update: {
          answers?: Json
          clerk_user_id?: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          questions?: Json
          score?: number | null
          session_id?: string
          started_at?: string | null
          status?: string
          time_limit_seconds?: number | null
          title?: string
          topic_scores?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_simulations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          clerk_user_id: string
          created_at: string
          due_at: string
          ease_factor: number
          front: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          repetitions: number
          session_id: string
          source: string | null
          topic: string | null
        }
        Insert: {
          back: string
          clerk_user_id: string
          created_at?: string
          due_at?: string
          ease_factor?: number
          front: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          repetitions?: number
          session_id: string
          source?: string | null
          topic?: string | null
        }
        Update: {
          back?: string
          clerk_user_id?: string
          created_at?: string
          due_at?: string
          ease_factor?: number
          front?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          repetitions?: number
          session_id?: string
          source?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary_terms: {
        Row: {
          clerk_user_id: string
          created_at: string
          definition: string
          id: string
          session_id: string
          source_document_id: string | null
          term: string
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          definition: string
          id?: string
          session_id: string
          source_document_id?: string | null
          term: string
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          definition?: string
          id?: string
          session_id?: string
          source_document_id?: string | null
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "glossary_terms_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glossary_terms_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      notebooks: {
        Row: {
          clerk_user_id: string
          content: string
          created_at: string
          id: string
          session_id: string
          title: string
          updated_at: string
        }
        Insert: {
          clerk_user_id: string
          content?: string
          created_at?: string
          id?: string
          session_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          clerk_user_id?: string
          content?: string
          created_at?: string
          id?: string
          session_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notebooks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clerk_user_id: string
          created_at: string
          default_model: string | null
          default_provider: string | null
          degree_program: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          study_goal: string | null
          theme: string | null
          university: string | null
          updated_at: string
          year_of_study: number | null
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          default_model?: string | null
          default_provider?: string | null
          degree_program?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          study_goal?: string | null
          theme?: string | null
          university?: string | null
          updated_at?: string
          year_of_study?: number | null
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          default_model?: string | null
          default_provider?: string | null
          degree_program?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          study_goal?: string | null
          theme?: string | null
          university?: string | null
          updated_at?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          archived: boolean
          clerk_user_id: string
          color: string | null
          created_at: string
          default_model: string | null
          default_provider: string | null
          description: string | null
          icon: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          clerk_user_id: string
          color?: string | null
          created_at?: string
          default_model?: string | null
          default_provider?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          clerk_user_id?: string
          color?: string | null
          created_at?: string
          default_model?: string | null
          default_provider?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      topic_mastery: {
        Row: {
          clerk_user_id: string
          id: string
          samples: number
          score: number
          session_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          clerk_user_id: string
          id?: string
          samples?: number
          score?: number
          session_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          clerk_user_id?: string
          id?: string
          samples?: number
          score?: number
          session_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_mastery_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          auth_tag: string
          ciphertext: string
          clerk_user_id: string
          created_at: string
          id: string
          iv: string
          label: string | null
          last4: string | null
          provider: string
          updated_at: string
        }
        Insert: {
          auth_tag: string
          ciphertext: string
          clerk_user_id: string
          created_at?: string
          id?: string
          iv: string
          label?: string | null
          last4?: string | null
          provider: string
          updated_at?: string
        }
        Update: {
          auth_tag?: string
          ciphertext?: string
          clerk_user_id?: string
          created_at?: string
          id?: string
          iv?: string
          label?: string | null
          last4?: string | null
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      whiteboards: {
        Row: {
          clerk_user_id: string
          created_at: string
          id: string
          session_id: string
          snapshot: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          id?: string
          session_id: string
          snapshot?: Json | null
          title?: string
          updated_at?: string
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          id?: string
          session_id?: string
          snapshot?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whiteboards_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_document_chunks: {
        Args: {
          match_count?: number
          p_clerk_user_id: string
          p_session_id: string
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
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
