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
      automation_idempotency_keys: {
        Row: {
          created_at: string
          error_payload: Json | null
          expires_at: string
          id: string
          operation_name: string
          request_hash: string
          request_key: string
          response_payload: Json | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_payload?: Json | null
          expires_at?: string
          id?: string
          operation_name: string
          request_hash: string
          request_key: string
          response_payload?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_payload?: Json | null
          expires_at?: string
          id?: string
          operation_name?: string
          request_hash?: string
          request_key?: string
          response_payload?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      approval_actions: {
        Row: {
          approval_request_id: string
          approver_user_id: string
          comment: string | null
          created_at: string
          decision: string
          id: string
        }
        Insert: {
          approval_request_id: string
          approver_user_id: string
          comment?: string | null
          created_at?: string
          decision?: string
          id?: string
        }
        Update: {
          approval_request_id?: string
          approver_user_id?: string
          comment?: string | null
          created_at?: string
          decision?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_actions_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          created_at: string
          current_approvals: number
          dual_approval_required: boolean
          evidence_payload: Json
          executed_at: string | null
          execution_payload: Json | null
          id: string
          last_approved_at: string | null
          operation_name: string
          preview_payload: Json
          request_hash: string
          request_key: string
          request_payload: Json
          requester_user_id: string
          required_approvals: number
          risk_level: string
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_approvals?: number
          dual_approval_required?: boolean
          evidence_payload?: Json
          executed_at?: string | null
          execution_payload?: Json | null
          id?: string
          last_approved_at?: string | null
          operation_name: string
          preview_payload?: Json
          request_hash: string
          request_key: string
          request_payload?: Json
          requester_user_id: string
          required_approvals?: number
          risk_level?: string
          status?: string
          summary: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_approvals?: number
          dual_approval_required?: boolean
          evidence_payload?: Json
          executed_at?: string | null
          execution_payload?: Json | null
          id?: string
          last_approved_at?: string | null
          operation_name?: string
          preview_payload?: Json
          request_hash?: string
          request_key?: string
          request_payload?: Json
          requester_user_id?: string
          required_approvals?: number
          risk_level?: string
          status?: string
          summary?: string
          updated_at?: string
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
      compliance_evidence_exports: {
        Row: {
          created_at: string
          evidence_bundle: Json
          evidence_hash: string
          export_type: string
          filters: Json
          generated_at: string
          id: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence_bundle?: Json
          evidence_hash: string
          export_type?: string
          filters?: Json
          generated_at?: string
          id?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          evidence_bundle?: Json
          evidence_hash?: string
          export_type?: string
          filters?: Json
          generated_at?: string
          id?: string
          status?: string
          title?: string
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
      automation_runs: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          mode: string
          source: string
          status: string
          summary: Json
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          mode: string
          source: string
          status?: string
          summary?: Json
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          mode?: string
          source?: string
          status?: string
          summary?: Json
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
      guardian_event_activity: {
        Row: {
          actor_arn: string | null
          actor_is_guardian: boolean
          actor_type: string | null
          auto_fixes: Json
          created_at: string
          event_id: string
          event_name: string
          id: string
          matched_policies: Json
          notifications: Json
          raw_event: Json
          region: string | null
          resource_id: string | null
          resource_type: string | null
          risk_level: string
          runbooks: Json
          source_ip: string | null
          user_id: string
        }
        Insert: {
          actor_arn?: string | null
          actor_is_guardian?: boolean
          actor_type?: string | null
          auto_fixes?: Json
          created_at?: string
          event_id: string
          event_name: string
          id?: string
          matched_policies?: Json
          notifications?: Json
          raw_event?: Json
          region?: string | null
          resource_id?: string | null
          resource_type?: string | null
          risk_level: string
          runbooks?: Json
          source_ip?: string | null
          user_id: string
        }
        Update: {
          actor_arn?: string | null
          actor_is_guardian?: boolean
          actor_type?: string | null
          auto_fixes?: Json
          created_at?: string
          event_id?: string
          event_name?: string
          id?: string
          matched_policies?: Json
          notifications?: Json
          raw_event?: Json
          region?: string | null
          resource_id?: string | null
          resource_type?: string | null
          risk_level?: string
          runbooks?: Json
          source_ip?: string | null
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
      notification_webhooks: {
        Row: {
          channel_type: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          subscribed_events: Json
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          channel_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          subscribed_events?: Json
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          channel_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          subscribed_events?: Json
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_entries: {
        Row: {
          id: string
          key: string
          request_count: number
          window_start: string
        }
        Insert: {
          id?: string
          key: string
          request_count?: number
          window_start?: string
        }
        Update: {
          id?: string
          key?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      stored_aws_credentials: {
        Row: {
          account_id: string | null
          created_at: string
          credential_method: string
          encrypted_access_key_id: string
          encrypted_secret_access_key: string
          encrypted_session_token: string | null
          guardian_enabled: boolean
          id: string
          label: string
          last_scan_at: string | null
          last_scan_status: string | null
          notification_email: string | null
          org_id: string | null
          region: string
          role_arn: string | null
          scan_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          credential_method?: string
          encrypted_access_key_id: string
          encrypted_secret_access_key: string
          encrypted_session_token?: string | null
          guardian_enabled?: boolean
          id?: string
          label?: string
          last_scan_at?: string | null
          last_scan_status?: string | null
          notification_email?: string | null
          org_id?: string | null
          region?: string
          role_arn?: string | null
          scan_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          credential_method?: string
          encrypted_access_key_id?: string
          encrypted_secret_access_key?: string
          encrypted_session_token?: string | null
          guardian_enabled?: boolean
          id?: string
          label?: string
          last_scan_at?: string | null
          last_scan_status?: string | null
          notification_email?: string | null
          org_id?: string | null
          region?: string
          role_arn?: string | null
          scan_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stored_aws_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_audit_cache: {
        Row: {
          account_id: string
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          last_refreshed_at: string
          planner: Json
          response: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_id: string
          cache_key: string
          created_at?: string
          expires_at: string
          id?: string
          last_refreshed_at?: string
          planner?: Json
          response: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_refreshed_at?: string
          planner?: Json
          response?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "member" | "viewer"
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
      app_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
