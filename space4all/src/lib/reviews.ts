import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  recommend: boolean;
  comment: string;
  created_at: string;
};

export const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Review[];
  },
});

export function summarize(reviews: Review[], placeId: string) {
  const list = reviews.filter((r) => r.place_id === placeId);
  if (!list.length) return { count: 0, avg: 0, recPct: 0 };
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  const recPct = Math.round((list.filter((r) => r.recommend).length / list.length) * 100);
  return { count: list.length, avg, recPct };
}
