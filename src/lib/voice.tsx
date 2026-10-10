import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "./i18n";

type Ctx = { enabled: boolean; toggle: () => void; speak: (text: string) => void; stop: () => void };
const VoiceContext = createContext<Ctx | null>(null);

const SELECTOR = "a,button,input,select,textarea,label,h1,h2,h3,p,li,[data-speak]";

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { voiceLang, t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const last = useRef<Element | null>(null);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voiceLang;
      const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(voiceLang.slice(0, 2)));
      if (v) u.voice = v;
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    },
    [voiceLang],
  );
  const stop = useCallback(() => window.speechSynthesis?.cancel(), []);

  useEffect(() => {
    setEnabled(localStorage.getItem("voice") === "1");
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("voice", next ? "1" : "0");
    if (next) speak(`${t.voiceOn}. ${t.voiceHint}`);
    else {
      stop();
      const u = new SpeechSynthesisUtterance(t.voiceOff);
      u.lang = voiceLang;
      window.speechSynthesis?.speak(u);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const read = (target: EventTarget | null, delay: number) => {
      const el = (target as Element | null)?.closest?.(SELECTOR);
      if (!el || el === last.current) return;
      last.current = el;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const h = el as HTMLElement;
        let text = h.getAttribute("data-speak") || h.getAttribute("aria-label") || "";
        if (!text && (h instanceof HTMLInputElement || h instanceof HTMLTextAreaElement)) {
          const lbl = h.labels?.[0]?.innerText || h.placeholder;
          text = `${lbl}. ${h.value}`;
        }
        if (!text) text = h.innerText;
        speak(text.replace(/\s+/g, " ").trim().slice(0, 400));
      }, delay);
    };
    const onFocus = (e: FocusEvent) => read(e.target, 50);
    const onOver = (e: PointerEvent) => read(e.target, 350);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("pointerover", onOver);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("pointerover", onOver);
    };
  }, [enabled, speak]);

  return <VoiceContext.Provider value={{ enabled, toggle, speak, stop }}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const c = useContext(VoiceContext);
  if (!c) throw new Error("useVoice outside provider");
  return c;
}
