import { Link } from "@tanstack/react-router";
import { Globe, Volume2, VolumeX, Accessibility } from "lucide-react";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import { useVoice } from "@/lib/voice";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { enabled, toggle } = useVoice();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Accessibility aria-hidden className="size-6" />
          </span>
          <span className="font-display">{t.appName}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-icon"
            aria-pressed={enabled}
            aria-label={`${t.voiceToggle}. ${enabled ? t.voiceOn : t.voiceOff}`}
            onClick={toggle}
          >
            {enabled ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
            <span className="hidden sm:inline">{enabled ? t.voiceOn : t.voiceOff}</span>
          </button>
          <label className="btn-icon relative cursor-pointer">
            <Globe aria-hidden />
            <span className="sr-only">{t.language}</span>
            <select
              aria-label={t.language}
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          {user ? (
            <button type="button" className="btn-ghost" onClick={() => supabase.auth.signOut()}>
              {t.signOut}
            </button>
          ) : (
            <Link to="/auth" className="btn-primary">
              {t.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
