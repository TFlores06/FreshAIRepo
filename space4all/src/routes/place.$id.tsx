import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Bus, MapPin, Navigation, Star, ThumbsDown, ThumbsUp, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PLACES, directionsUrl, embedUrl, mapUrl } from "@/lib/places";
import { reviewsQuery, summarize } from "@/lib/reviews";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ReadAloud } from "@/components/ReadAloud";
import { noiseIcon } from "./index";

export const Route = createFileRoute("/place/$id")({
  loader: ({ params }) => {
    const place = PLACES.find((p) => p.id === params.id);
    if (!place) throw notFound();
    return { place };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.place.name ?? "Place"} — Space4All` },
      { name: "description", content: loaderData?.place.description.en ?? "" },
      { property: "og:title", content: `${loaderData?.place.name} — Space4All` },
      { property: "og:description", content: loaderData?.place.description.en ?? "" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlacePage,
});

function PlacePage() {
  const { place: p } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: all = [] } = useQuery(reviewsQuery);
  const reviews = all.filter((r) => r.place_id === p.id);
  const s = summarize(all, p.id);
  const Icon = noiseIcon(p.noise);

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
      place_id: p.id,
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
    <div id="page" className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4">
        <ArrowLeft aria-hidden className="size-4" /> {t.back}
      </Link>

      <header className="space-y-3">
        <span className="tag">{t[p.category]}</span>
        <h1 className="text-4xl font-extrabold md:text-5xl">{p.name}</h1>
        <p className="flex items-center gap-1 text-lg text-muted-foreground"><MapPin aria-hidden className="size-5" /> {p.address}</p>
        <p className="max-w-3xl text-lg">{p.description[lang]}</p>
        <div className="flex flex-wrap gap-2">
          <span className="tag">{"€".repeat(p.price)} · {t[`price${p.price}`]}</span>
          <span className="tag"><Icon aria-hidden className="size-4" /> {t[p.noise]}</span>
          {s.count > 0 && <span className="tag"><Star aria-hidden className="size-4" /> {s.avg.toFixed(1)} · {s.recPct}% {t.recommended}</span>}
        </div>
        <ReadAloud targetId="page" />
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card space-y-3 p-5">
          <h2 className="text-2xl font-bold">{t.features}</h2>
          <ul className="space-y-2">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-2"><Check aria-hidden className="size-5 text-success" /> {t[f]}</li>
            ))}
          </ul>
        </section>
        <section className="card space-y-3 p-5">
          <h2 className="text-2xl font-bold">{t.priceList}</h2>
          <ul className="divide-y divide-border">
            {p.priceList.map((it, i) => (
              <li key={i} className="flex justify-between py-2">
                <span>{it.item[lang]}</span>
                <span className="font-bold">{it.eur === 0 ? t.free : `€${it.eur.toFixed(2)}`}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card space-y-4 p-5">
        <h2 className="text-2xl font-bold">{t.howToGet}</h2>
        <p className="flex items-start gap-2 text-lg">
          <Bus aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
          {t.transitText(t[p.transit.mode], p.transit.lines.join(", "), p.transit.stop, p.transit.walkMin)}
        </p>
        <p className={p.transit.lowFloor ? "" : "font-bold text-destructive"}>
          {p.transit.lowFloor ? t.lowFloor : t.notLowFloor}
        </p>
        <div className="flex flex-wrap gap-2">
          <a href={directionsUrl(p)} target="_blank" rel="noreferrer" className="btn-primary">
            <Navigation aria-hidden className="size-4" /> {t.directions}
          </a>
          <a href={mapUrl(p)} target="_blank" rel="noreferrer" className="btn-ghost">{t.openMap}</a>
        </div>
        <iframe
          title={`${t.map}: ${p.name}`}
          src={embedUrl(p, lang)}
          className="h-80 w-full rounded-xl border border-border"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">{t.reviews}</h2>
        {user ? (
          <form onSubmit={submit} className="card space-y-4 p-5">
            <h3 className="text-xl font-bold">{t.writeReview}</h3>
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
              <label htmlFor="comment" className="label">{t.comment}</label>
              <textarea id="comment" required maxLength={1000} rows={4} className="field" placeholder={t.commentPh} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            {err && <p role="alert" className="font-bold text-destructive">{err}</p>}
            <button type="submit" disabled={busy} className="btn-primary">{t.submit}</button>
          </form>
        ) : (
          <Link to="/auth" className="btn-accent">{t.signInToReview}</Link>
        )}
        {!reviews.length && <p className="text-muted-foreground">{t.noReviews}</p>}
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="card space-y-2 p-5">
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
      </section>
    </div>
  );
}
