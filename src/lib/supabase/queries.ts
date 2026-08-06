import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CareerResult } from "@/lib/types/game";

export async function persistCareerResult(result: CareerResult): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { data, error } = await supabase
    .from("careers")
    .insert({
      nickname: result.nickname,
      role: result.role,
      region: result.region,
      nationality: result.nationality,
      final_rating: result.finalRating,
      trophies: result.trophies,
      majors: result.majors,
      total_kills: result.totalKills,
      fame: result.fame,
      fame_level: result.fameLevel,
      earnings: result.earnings,
      years_played: result.yearsPlayed,
      teams_played: result.teamsPlayed,
      legend_comparison: result.legendComparison,
      score: result.score,
      is_daily: result.isDaily,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.warn("Could not persist career:", error?.message);
    return;
  }

  if (result.isDaily) {
    const today = new Date().toISOString().slice(0, 10);
    const { error: rankingError } = await supabase.from("daily_rankings").insert({
      career_id: data.id as string,
      score: result.score,
      rank_date: today,
    });
    if (rankingError) {
      console.warn("Could not persist daily ranking:", rankingError.message);
    }
  }
}

export type RankingRow = {
  id: string;
  score: number;
  nickname: string;
  role: string;
  final_rating: number;
  trophies: number;
  majors: number;
  legend_comparison: string;
};

type DailyRankingJoin = {
  id: string;
  score: number;
  careers:
    | {
        nickname: string;
        role: string;
        final_rating: number;
        trophies: number;
        majors: number;
        legend_comparison: string;
      }
    | {
        nickname: string;
        role: string;
        final_rating: number;
        trophies: number;
        majors: number;
        legend_comparison: string;
      }[]
    | null;
};

export async function fetchDailyRankings(): Promise<RankingRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_rankings")
    .select(
      "id, score, careers(nickname, role, final_rating, trophies, majors, legend_comparison)",
    )
    .eq("rank_date", today)
    .order("score", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.warn("Could not fetch rankings:", error?.message);
    return [];
  }

  return (data as DailyRankingJoin[]).map((row) => {
    const career = Array.isArray(row.careers) ? row.careers[0] : row.careers;
    return {
      id: row.id,
      score: row.score,
      nickname: career?.nickname ?? "Unknown",
      role: career?.role ?? "entryFragger",
      final_rating: career?.final_rating ?? 0,
      trophies: career?.trophies ?? 0,
      majors: career?.majors ?? 0,
      legend_comparison: career?.legend_comparison ?? "",
    };
  });
}

export async function fetchRecentCareers(): Promise<RankingRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("careers")
    .select(
      "id, score, nickname, role, final_rating, trophies, majors, legend_comparison",
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !data) {
    return [];
  }

  return data as RankingRow[];
}
