import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Open Vilnius" },
      { name: "description", content: "Sign in or create an account to review accessible places in Vilnius." },
      { property: "og:title", content: "Sign in — Open Vilnius" },
      { property: "og:description", content: "Join Open Vilnius and share accessibility reviews." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { display_name: name } },
      });
      setBusy(false);
      if (error) return setErr(error.message);
      if (data.session) navigate({ to: "/" });
      else setMsg(t.checkEmail);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setErr(error.message);
      navigate({ to: "/" });
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return setErr(String(r.error.message ?? r.error));
    if (r.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card space-y-5 p-6">
        <h1 className="text-3xl font-extrabold">{mode === "in" ? t.signIn : t.createAccount}</h1>
        <button type="button" onClick={google} className="btn-ghost w-full">{t.google}</button>
        <p className="text-center text-muted-foreground">{t.or}</p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "up" && (
            <div>
              <label htmlFor="name" className="label">{t.displayName}</label>
              <input id="name" required className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="label">{t.email}</label>
            <input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label htmlFor="pw" className="label">{t.password}</label>
            <input id="pw" type="password" required minLength={6} className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          </div>
          {err && <p role="alert" className="font-bold text-destructive">{err}</p>}
          {msg && <p role="status" className="font-bold text-success">{msg}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">{mode === "in" ? t.signIn : t.createAccount}</button>
        </form>
        <button type="button" className="w-full font-bold text-primary underline underline-offset-4" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? t.noAccount : t.haveAccount}
        </button>
      </div>
    </div>
  );
}
