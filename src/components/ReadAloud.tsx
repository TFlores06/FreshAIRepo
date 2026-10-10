import { Volume2, Square } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useVoice } from "@/lib/voice";

export function ReadAloud({ targetId }: { targetId: string }) {
  const { t } = useI18n();
  const { speak, stop } = useVoice();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="btn-accent"
        onClick={() => {
          const el = document.getElementById(targetId);
          if (el) speak(el.innerText.replace(/\s+/g, " ").slice(0, 3000));
        }}
      >
        <Volume2 aria-hidden /> {t.readPage}
      </button>
      <button type="button" className="btn-icon" aria-label={t.stop} onClick={stop}>
        <Square aria-hidden className="size-4" />
      </button>
    </div>
  );
}
