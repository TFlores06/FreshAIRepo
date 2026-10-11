import { Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const SUPPORT_EMAIL = "support@space4all.lt";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-12 border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8">
        <p className="font-display text-xl font-bold text-primary">Space4All</p>
        <div className="flex flex-wrap gap-4 text-lg">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 font-bold underline underline-offset-4">
            <Mail aria-hidden className="size-5" /> {t.support}: {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
