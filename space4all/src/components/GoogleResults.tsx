import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Star, ExternalLink, Accessibility, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react";
import { searchGooglePlaces, startPlacesSession } from "@/lib/google-places.functions";
import { useI18n } from "@/lib/i18n";
import { reviewsQuery, summarize } from "@/lib/reviews";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const PRICE: Record<string, number> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

function PlaceReviews({ placeId }: { placeId: string }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: all = [] } = useQuery(reviewsQuery);
  const reviews = all.filter((r) => r.place_id === placeId);

  const [rating, setRating] = useState(5);
  const [recommend, setRecommend] = useState(true);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setBusy(true);
    setErr("");
    const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    const { error } = await supabase.from("reviews").insert({
      place_id: placeId,
      user_id: user.id,
      author_name: prof?.display_name || user.email?.split("@")[0] || "",
      rating,
      recommend,
      comment: comment.trim().slice(0, 1000),
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setComment("");
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const remove = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  return (
    <div className="space-y-3 border-t border-border pt-3">
      {user ? (
        <form onSubmit={submit} className="space-y-3">
          <fieldset>
            <legend className="label">{t.rating}</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className="btn-icon" aria-pressed={rating === n} aria-label={`${n} ${t.stars}`} onClick={() => setRating(n)}>
                  <Star aria-hidden className={n <= rating ? "fill-current" : ""} />
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label">{t.recommendQ}</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="chip" aria-pressed={recommend} onClick={() => setRecommend(true)}>
                <ThumbsUp aria-hidden className="size-4" /> {t.recommend}
              </button>
              <button type="button" className="chip" aria-pressed={!recommend} onClick={() => setRecommend(false)}>
                <ThumbsDown aria-hidden className="size-4" /> {t.notRecommend}
              </button>
            </div>
          </fieldset>
          <div>
            <label htmlFor={`comment-${placeId}`} className="label">{t.comment}</label>
            <textarea id={`comment-${placeId}`} required maxLength={1000} rows={3} className="field" placeholder={t.commentPh} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          {err && <p role="alert" className="font-bold text-destructive">{err}</p>}
          <button type="submit" disabled={busy} className="btn-primary">{t.submit}</button>
        </form>
      ) : (
        <Link to="/auth" className="btn-accent w-fit">{t.signInToReview}</Link>
      )}
      {!reviews.length && <p className="text-muted-foreground">{t.noReviews}</p>}
      <ul className="space-y-2">
        {reviews.map((r) => (
          <li key={r.id} className="space-y-1 rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{r.author_name}</strong>
              <span className="flex items-center gap-2">
                <span className="tag" aria-label={`${r.rating} ${t.stars}`}>
                  <Star aria-hidden className="size-4 fill-current" /> {r.rating}/5
                </span>
                <span className={r.recommend ? "tag" : "tag text-destructive"}>
                  {r.recommend ? <ThumbsUp aria-hidden className="size-4" /> : <ThumbsDown aria-hidden className="size-4" />}
                  {r.recommend ? t.recommend : t.notRecommend}
                </span>
              </span>
            </div>
            <p>{r.comment}</p>
            <div className="flex justify-between text-sm text-muted-foreground">
              <time dateTime={r.created_at}>{new Date(r.created_at).toLocaleDateString(lang)}</time>
              {user?.id === r.user_id && (
                <button type="button" className="font-bold text-destructive underline" onClick={() => remove(r.id)}>{t.delete}</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GoogleResults({ query }: { query: string }) {
  const { t, lang } = useI18n();
  const search = useServerFn(searchGooglePlaces);
  const startSession = useServerFn(startPlacesSession);
  const [q, setQ] = useState(query);
  const [wheelOnly, setWheelOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const { data: allReviews = [] } = useQuery(reviewsQuery);

  useEffect(() => {
    const id = setTimeout(() => setQ(query.trim()), 600);
    return () => clearTimeout(id);
  }, [query]);

  const enabled = q.length >= 2;
  const { data, isFetching, error } = useQuery({
    queryKey: ["gplaces", q, lang],
    queryFn: async () => {
      await startSession();
      return search({ data: { query: q, lang } });
    },
    enabled,
    staleTime: 10 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (q.length < 2) return null;

  const list = (data ?? []).filter((p) => !wheelOnly || p.wheelchairEntrance);

  return (
    <section aria-live="polite" className="mt-10">
      <h2 className="mb-2 text-2xl font-bold">{t.googleTitle}</h2>
      {isFetching ? (
        <p className="card p-5">{t.googleLoading}</p>
      ) : error ? (
        <p className="card p-5">{t.googleError}</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-lg font-bold">{list.length} {t.results}</p>
            <label className="chip">
              <input type="checkbox" className="size-5" checked={wheelOnly} onChange={() => setWheelOnly(!wheelOnly)} />
              {t.wheelchair}
            </label>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {list.map((p) => {
              const s = summarize(allReviews, p.id);
              const isOpen = open === p.id;
              return (
                <li key={p.id} className="card flex flex-col gap-2 p-4">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <MapPin aria-hidden className="size-4 shrink-0" /> {p.address}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {p.rating != null && (
                      <span className="tag"><Star aria-hidden className="size-4" /> {p.rating.toFixed(1)} ({p.ratingCount ?? 0})</span>
                    )}
                    {p.priceLevel && PRICE[p.priceLevel] && <span className="tag">{"€".repeat(PRICE[p.priceLevel] ?? 1)}</span>}
                    {p.wheelchairEntrance && <span className="tag"><Accessibility aria-hidden className="size-4" /> {t.wheelchair}</span>}
                    {p.wheelchairToilet && <span className="tag">{t.accessibleToilet}</span>}
                    {p.wheelchairParking && <span className="tag">{t.parking}</span>}
                    {s.count > 0 && (
                      <span className="tag"><Star aria-hidden className="size-4 fill-current" /> {t.community}: {s.avg.toFixed(1)} ({s.count})</span>
                    )}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    {p.mapsUri && (
                      <a href={p.mapsUri} target="_blank" rel="noreferrer" className="btn-ghost w-fit">
                        <ExternalLink aria-hidden className="size-4" /> {t.openInMaps}
                      </a>
                    )}
                    <button type="button" className="btn-ghost w-fit" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : p.id)}>
                      {isOpen ? <ChevronUp aria-hidden className="size-4" /> : <ChevronDown aria-hidden className="size-4" />}
                      {t.reviews}{s.count > 0 ? ` (${s.count})` : ""}
                    </button>
                  </div>
                  {isOpen && <PlaceReviews placeId={p.id} />}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
