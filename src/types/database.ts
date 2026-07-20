/**
 * Hand-typed Supabase database schema. Mirrors:
 *   0001_init.sql        — users, projects, blocks, comments, shares
 *   0002_share_rpc.sql   — get_share_by_token (returns a row-shaped snapshot)
 *   0003_platform.sql    — workspaces, folders, items, tags, mentions,
 *                          notifications, ai_artifacts, integrations
 *
 * When wiring real Supabase, regenerate with:
 *   supabase gen types typescript --project-id <ref> --schema public \
 *     > src/types/database.ts
 * and diff against this file.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Phase = "Brief" | "Concept" | "Delivery";

export type ItemType =
  | "note"
  | "task"
  | "file"
  | "bookmark"
  | "research"
  | "idea"
  | "person"
  | "event"
  | "quote"
  | "image"
  | "video";

export type IntegrationProvider =
  | "google_drive"
  | "figma"
  | "github"
  | "slack"
  | "notion"
  | "miro"
  | "linear"
  | "dropbox";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; created_at: string };
        Insert: { id: string; email: string; created_at?: string };
        Update: Partial<{ id: string; email: string; created_at: string }>;
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          workspace_id: string;
          parent_id: string | null;
          name: string;
          icon: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          parent_id?: string | null;
          name: string;
          icon?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          workspace_id: string;
          parent_id: string | null;
          name: string;
          icon: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          client_name: string;
          phase: Phase;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          client_name: string;
          phase?: Phase;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          title: string;
          client_name: string;
          phase: Phase;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      blocks: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          content: Json;
          x: number;
          y: number;
          width: number;
          height: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: string;
          content?: Json;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          project_id: string;
          type: string;
          content: Json;
          x: number;
          y: number;
          width: number;
          height: number;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          project_id: string;
          block_id: string | null;
          text: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          block_id?: string | null;
          text: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          project_id: string;
          block_id: string | null;
          text: string;
          user_id: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      shares: {
        Row: {
          id: string;
          project_id: string;
          token: string;
          read_only: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          token: string;
          read_only?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          project_id: string;
          token: string;
          read_only: boolean;
          created_at: string;
        }>;
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          workspace_id: string;
          folder_id: string | null;
          project_id: string | null;
          type: ItemType;
          title: string;
          content: Json;
          status: string | null;
          due_at: string | null;
          url: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          folder_id?: string | null;
          project_id?: string | null;
          type: ItemType;
          title?: string;
          content?: Json;
          status?: string | null;
          due_at?: string | null;
          url?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          workspace_id: string;
          folder_id: string | null;
          project_id: string | null;
          type: ItemType;
          title: string;
          content: Json;
          status: string | null;
          due_at: string | null;
          url: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          workspace_id: string;
          name: string;
          color: string | null;
          created_at: string;
        }>;
        Relationships: [];
      };
      item_tags: {
        Row: { item_id: string; tag_id: string };
        Insert: { item_id: string; tag_id: string };
        Update: Partial<{ item_id: string; tag_id: string }>;
        Relationships: [];
      };
      mentions: {
        Row: {
          id: string;
          source_item_id: string;
          target_item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_item_id: string;
          target_item_id: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          source_item_id: string;
          target_item_id: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          title: string;
          body: string | null;
          target_url: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          title: string;
          body?: string | null;
          target_url?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          kind: string;
          title: string;
          body: string | null;
          target_url: string | null;
          read_at: string | null;
          created_at: string;
        }>;
        Relationships: [];
      };
      ai_artifacts: {
        Row: {
          id: string;
          workspace_id: string;
          item_id: string | null;
          project_id: string | null;
          kind: string;
          prompt: string;
          output: Json;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          item_id?: string | null;
          project_id?: string | null;
          kind: string;
          prompt: string;
          output: Json;
          model?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          workspace_id: string;
          item_id: string | null;
          project_id: string | null;
          kind: string;
          prompt: string;
          output: Json;
          model: string | null;
          created_at: string;
        }>;
        Relationships: [];
      };
      integrations: {
        Row: {
          id: string;
          workspace_id: string;
          provider: IntegrationProvider;
          status: "pending" | "connected" | "disconnected" | "error";
          external_account: string | null;
          sync_cursor: string | null;
          config: Json;
          connected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider: IntegrationProvider;
          status?: "pending" | "connected" | "disconnected" | "error";
          external_account?: string | null;
          sync_cursor?: string | null;
          config?: Json;
          connected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          workspace_id: string;
          provider: IntegrationProvider;
          status: "pending" | "connected" | "disconnected" | "error";
          external_account: string | null;
          sync_cursor: string | null;
          config: Json;
          connected_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_share_by_token: {
        Args: { token: string };
        Returns: Array<{
          project_id: string;
          title: string;
          client_name: string;
          phase: string;
          blocks: Json;
          comments: Json;
        }>;
      };
    };
    Enums: {
      phase: Phase;
      item_type: ItemType;
    };
    CompositeTypes: Record<string, never>;
  };
}
