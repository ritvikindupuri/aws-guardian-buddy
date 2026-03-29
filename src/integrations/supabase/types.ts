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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_audit_log: {
        Row: {
          aws_operation: string
          aws_region: string
          aws_service: string
          conversation_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          params_hash: string | null
          status: string
          user_id: string
          validator_result: string | null
        }
        Insert: {
          aws_operation: string
          aws_region: string
          aws_service: string
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          params_hash?: string | null
          status?: string
          user_id: string
          validator_result?: string | null
        }
        Update: {
          aws_operation?: string
          aws_region?: string
          aws_service?: string
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          params_hash?: string | null
          status?: string
          user_id?: string
          validator_result?: string | null
        }
        Relationships: []
      }
      cost_automation_rules: {
        Row: {
          action: string
          channels: string[] | null
          created_at: string
          id: string
          multiplier: number | null
          raw_query: string | null
          requires_confirm: boolean
          rule_id: string
          rule_type: string
          scope: string
          threshold: number | null
          user_id: string
        }
        Insert: {
          action: string
          channels?: string[] | null
          created_at?: string
          id?: string
          multiplier?: number | null
          raw_query?: string | null
          requires_confirm?: boolean
          rule_id: string
          rule_type: string
          scope: string
          threshold?: number | null
          user_id: string
        }
        Update: {
          action?: string
          channels?: string[] | null
          created_at?: string
          id?: string
          multiplier?: number | null
          raw_query?: string | null
          requires_confirm?: boolean
          rule_id?: string
          rule_type?: string
          scope?: string
          threshold?: number | null
          user_id?: string
        }
        Relationships: []
      }
      drift_events: {
        Row: {
          account_id: string
          baseline_state: Json | null
          change_type: string
          current_state: Json | null
          detected_at: string
          diff: Json
          explanation: string | null
          fix_prompt: string | null
          id: string
          region: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string
          resource_type: string
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          account_id: string
          baseline_state?: Json | null
          change_type: string
          current_state?: Json | null
          detected_at: string
          diff: Json
          explanation?: string | null
          fix_prompt?: string | null
          id?: string
          region: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id: string
          resource_type: string
          severity: string
          title: string
          user_id: string
        }
        Update: {
          account_id?: string
          baseline_state?: Json | null
          change_type?: string
          current_state?: Json | null
          detected_at?: string
          diff?: Json
          explanation?: string | null
          fix_prompt?: string | null
          id?: string
          region?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string
          resource_type?: string
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      event_response_policies: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          notify_channels: Json
          policy_id: string
          raw_query: string
          response_action: string
          response_params: Json
          response_type: string
          risk_threshold: string
          trigger_conditions: Json
          trigger_event: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          notify_channels?: Json
          policy_id: string
          raw_query: string
          response_action: string
          response_params?: Json
          response_type?: string
          risk_threshold?: string
          trigger_conditions?: Json
          trigger_event: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          notify_channels?: Json
          policy_id?: string
          raw_query?: string
          response_action?: string
          response_params?: Json
          response_type?: string
          risk_threshold?: string
          trigger_conditions?: Json
          trigger_event?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_operation_history: {
        Row: {
          account_count: number
          action: string
          blocked: Json
          created_at: string
          env_breakdown: Json
          execution_summary: Json | null
          id: string
          preview_payload: Json
          rollback_plan: string | null
          scp_template: string | null
          scope: string
          status: string
          user_id: string
          warnings: Json
        }
        Insert: {
          account_count?: number
          action: string
          blocked?: Json
          created_at?: string
          env_breakdown?: Json
          execution_summary?: Json | null
          id?: string
          preview_payload?: Json
          rollback_plan?: string | null
          scp_template?: string | null
          scope: string
          status?: string
          user_id: string
          warnings?: Json
        }
        Update: {
          account_count?: number
          action?: string
          blocked?: Json
          created_at?: string
          env_breakdown?: Json
          execution_summary?: Json | null
          id?: string
          preview_payload?: Json
          rollback_plan?: string | null
          scp_template?: string | null
          scope?: string
          status?: string
          user_id?: string
          warnings?: Json
        }
        Relationships: []
      }
      resource_snapshots: {
        Row: {
          account_id: string
          captured_at: string
          fingerprint: string
          id: string
          is_baseline: boolean
          region: string
          resource_id: string
          resource_type: string
          state: Json
          user_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          fingerprint: string
          id?: string
          is_baseline?: boolean
          region: string
          resource_id: string
          resource_type: string
          state: Json
          user_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          fingerprint?: string
          id?: string
          is_baseline?: boolean
          region?: string
          resource_id?: string
          resource_type?: string
          state?: Json
          user_id?: string
        }
        Relationships: []
      }
      runbook_execution_steps: {
        Row: {
          created_at: string
          execution_id: string
          id: string
          output: string | null
          risk: string
          status: string
          step_id: string
          step_name: string
          step_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          execution_id: string
          id?: string
          output?: string | null
          risk: string
          status: string
          step_id: string
          step_name: string
          step_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          execution_id?: string
          id?: string
          output?: string | null
          risk?: string
          status?: string
          step_id?: string
          step_name?: string
          step_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runbook_execution_steps_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "runbook_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      runbook_executions: {
        Row: {
          approved_by: string | null
          conversation_id: string | null
          created_at: string
          current_step_index: number
          dry_run: boolean
          id: string
          last_error: string | null
          results: Json
          runbook_id: string
          runbook_name: string
          status: string
          steps: Json
          trigger_query: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          conversation_id?: string | null
          created_at?: string
          current_step_index?: number
          dry_run?: boolean
          id?: string
          last_error?: string | null
          results?: Json
          runbook_id: string
          runbook_name: string
          status?: string
          steps?: Json
          trigger_query: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          conversation_id?: string | null
          created_at?: string
          current_step_index?: number
          dry_run?: boolean
          id?: string
          last_error?: string | null
          results?: Json
          runbook_id?: string
          runbook_name?: string
          status?: string
          steps?: Json
          trigger_query?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runbook_executions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
