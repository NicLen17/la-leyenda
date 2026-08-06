export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      careers: {
        Row: {
          id: string;
          user_id: string | null;
          nickname: string;
          role: string;
          region: string;
          nationality: string;
          final_rating: number;
          trophies: number;
          majors: number;
          total_kills: number;
          fame: number;
          fame_level: string;
          earnings: number;
          years_played: number;
          teams_played: string[];
          legend_comparison: string;
          score: number;
          is_daily: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          nickname: string;
          role: string;
          region: string;
          nationality: string;
          final_rating: number;
          trophies: number;
          majors: number;
          total_kills: number;
          fame: number;
          fame_level: string;
          earnings: number;
          years_played: number;
          teams_played: string[];
          legend_comparison: string;
          score: number;
          is_daily?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["careers"]["Insert"]>;
      };
      daily_rankings: {
        Row: {
          id: string;
          career_id: string;
          user_id: string | null;
          score: number;
          rank_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          career_id: string;
          user_id?: string | null;
          score: number;
          rank_date: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_rankings"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          total_careers: number;
          best_rating: number;
          best_score: number;
          achievements: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          total_careers?: number;
          best_rating?: number;
          best_score?: number;
          achievements?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
