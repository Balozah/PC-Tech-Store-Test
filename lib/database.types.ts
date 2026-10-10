// Hand-written to match supabase/schema.sql.
// Once the real Supabase project exists, regenerate with:
//   supabase gen types typescript --project-id <id> > lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string };
        Insert: { user_id: string };
        Update: { user_id?: string };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          business_name_ar: string;
          business_name_en: string | null;
          whatsapp: string | null;
          currency: string;
          address_ar: string | null;
          address_en: string | null;
          maps_url: string | null;
          maps_embed_url: string | null;
          hours: Json;
          socials: Json;
        };
        Insert: {
          id?: number;
          business_name_ar: string;
          business_name_en?: string | null;
          whatsapp?: string | null;
          currency?: string;
          address_ar?: string | null;
          address_en?: string | null;
          maps_url?: string | null;
          maps_embed_url?: string | null;
          hours?: Json;
          socials?: Json;
        };
        Update: {
          id?: number;
          business_name_ar?: string;
          business_name_en?: string | null;
          whatsapp?: string | null;
          currency?: string;
          address_ar?: string | null;
          address_en?: string | null;
          maps_url?: string | null;
          maps_embed_url?: string | null;
          hours?: Json;
          socials?: Json;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_ar: string;
          name_en: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ar?: string;
          name_en?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          slug: string;
          name_ar: string;
          name_en: string | null;
          description_ar: string | null;
          description_en: string | null;
          price_usd: number | null;
          price_syp: number | null;
          price_on_request: boolean;
          is_available: boolean;
          sort_order: number;
          specs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          slug: string;
          name_ar: string;
          name_en?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          price_usd?: number | null;
          price_syp?: number | null;
          price_on_request?: boolean;
          is_available?: boolean;
          sort_order?: number;
          specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          slug?: string;
          name_ar?: string;
          name_en?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          price_usd?: number | null;
          price_syp?: number | null;
          price_on_request?: boolean;
          is_available?: boolean;
          sort_order?: number;
          specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: { id: string; product_id: string; path: string; sort_order: number };
        Insert: { id?: string; product_id: string; path: string; sort_order?: number };
        Update: { id?: string; product_id?: string; path?: string; sort_order?: number };
        Relationships: [];
      };
      option_groups: {
        Row: {
          id: string;
          product_id: string;
          name_ar: string;
          name_en: string | null;
          kind: "text" | "color";
          is_required: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          name_ar: string;
          name_en?: string | null;
          kind?: "text" | "color";
          is_required?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          name_ar?: string;
          name_en?: string | null;
          kind?: "text" | "color";
          is_required?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      option_values: {
        Row: {
          id: string;
          group_id: string;
          label_ar: string;
          label_en: string | null;
          hex: string | null;
          price_override_usd: number | null;
          price_override_syp: number | null;
          is_available: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          group_id: string;
          label_ar: string;
          label_en?: string | null;
          hex?: string | null;
          price_override_usd?: number | null;
          price_override_syp?: number | null;
          is_available?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          group_id?: string;
          label_ar?: string;
          label_en?: string | null;
          hex?: string | null;
          price_override_usd?: number | null;
          price_override_syp?: number | null;
          is_available?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          author_name: string;
          rating: number;
          comment: string | null;
          status: "pending" | "approved";
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          author_name: string;
          rating: number;
          comment?: string | null;
          status?: "pending" | "approved";
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          author_name?: string;
          rating?: number;
          comment?: string | null;
          status?: "pending" | "approved";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
