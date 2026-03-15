"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AVATARS } from "@/lib/challenges/data";

const BADGES = [
  { id: "first", em: "🎯", name: "Første steg", desc: "Fullfør din første utfordring", req: 1 },
  { id: "five", em: "🔥", name: "På gli", desc: "Fullfør 5 utfordringer", req: 5 },
  { id: "ten", em: "💪", name: "Maskin", desc: "Fullfør 10 utfordringer", req: 10 },
  { id: "streak3", em: "⚡", name: "Streket opp", desc: "Bygg en 3-dagers streak", req: 3 },
  { id: "hundred", em: "💯", name: "Legende", desc: "Nå 100 poeng", req: 100 },
  { id: "camera", em: "📸", name: "Bevisman", desc: "Last opp et bevis-bilde", req: 1 },
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, setProfile, resetProfile } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmoji, setEditEmoji] = useState(profile.emoji);
  const [saving, setSaving] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetProfile();
    router.push("/login");
    router.refresh();
  }

  async function handleSaveProfile() {
    if (!editName.trim()) {
      toast.error("Navn kan ikke være tomt");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ username: editName.trim(), avatar_url: editEmoji })
        .eq("id", user.id);
    }
    setProfile({ name: editName.trim(), emoji: editEmoji });
    setEditing(false);
    setSaving(false);
    toast.success("Profil oppdatert! ✅");
  }

  const earnedBadgeIds = new Set([
    profile.done >= 1 ? "first" : null,
    profile.done >= 5 ? "five" : null,
    profile.done >= 10 ? "ten" : null,
    profile.streak >= 3 ? "streak3" : null,
    profile.pts >= 100 ? "hundred" : null,
  ].filter(Boolean));

  return (
    <div style={{ animation: "slideUp 0.32s cubic-bezier(0.16,1,0.3,1)" }}>
      <div className="pt-12 pb-2">
        <div
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 2 }}
          className="text-white"
        >
          PROFIL
        </div>
      </div>

      {/* Hero / Edit */}
      <div
        className="rounded-[20px] p-5 mb-3.5"
        style={{
          background: "linear-gradient(135deg, rgba(255,45,85,.08), rgba(0,199,255,.04))",
          border: "1.5px solid rgba(255,255,255,0.063)",
        }}
      >
        {editing ? (
          <div>
            {/* Avatar picker */}
            <div className="text-xs font-bold text-[#55556a] uppercase tracking-wider mb-2">Velg avatar</div>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {AVATARS.map((a) => (
                <button
                  key={a.em}
                  onClick={() => setEditEmoji(a.em)}
                  className="text-2xl rounded-xl py-2 transition-all active:scale-[0.9]"
                  style={{
                    background: editEmoji === a.em ? "rgba(255,45,85,.18)" : "#161622",
                    border: `1.5px solid ${editEmoji === a.em ? "#ff2d55" : "transparent"}`,
                  }}
                >
                  {a.em}
                </button>
              ))}
            </div>
            {/* Name input */}
            <div className="text-xs font-bold text-[#55556a] uppercase tracking-wider mb-2">Navn</div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={20}
              placeholder="Ditt navn..."
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-base outline-none mb-3"
              style={{
                background: "#0a0a0f",
                border: "1.5px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#00f0ff")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl font-extrabold text-sm text-white active:scale-[0.97] transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b00)" }}
              >
                {saving ? "Lagrer..." : "✓ Lagre"}
              </button>
              <button
                onClick={() => { setEditing(false); setEditName(profile.name); setEditEmoji(profile.emoji); }}
                className="flex-1 py-3 rounded-2xl font-bold text-sm text-[#55556a] active:scale-[0.97] transition-all"
                style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.063)" }}
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-[52px] leading-none">{profile.emoji}</div>
            <div className="flex-1">
              <div
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, lineHeight: 1 }}
                className="mb-1.5"
              >
                {profile.name || "–"}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  `${profile.done} fullført`,
                  `${profile.streak} streak`,
                  `${profile.pts} pts`,
                  profile.ageGroup,
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-[#55556a] rounded-lg px-2.5 py-0.5 font-semibold"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setEditing(true); setEditName(profile.name); setEditEmoji(profile.emoji); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg active:scale-[0.9] transition-all flex-shrink-0"
              style={{ background: "rgba(255,255,255,.07)", border: "1.5px solid rgba(255,255,255,.12)" }}
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* Streak card */}
      <div
        className="rounded-[18px] p-5 flex items-center justify-between relative overflow-hidden mb-3.5"
        style={{ background: "#111118", border: "1.5px solid rgba(255,255,255,0.063)" }}
      >
        <div
          className="absolute right-[-8px] bottom-[-8px] text-[90px] opacity-[0.05] pointer-events-none select-none"
          aria-hidden
        >
          🔥
        </div>
        <div>
          <div
            className="gradient-text-streak"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 58, lineHeight: 1 }}
          >
            {profile.streak}
          </div>
          <div className="text-xs text-[#55556a] font-bold uppercase tracking-[0.8px] mt-0.5">
            Dagers streak 🔥
          </div>
        </div>
        <div className="text-right">
          <div
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: "#00f0ff" }}
          >
            {profile.best}
          </div>
          <div className="text-[11px] text-[#55556a] font-semibold">Beste streak</div>
          {profile.streak > 0 && profile.streak === profile.best && (
            <div className="text-[11px] font-extrabold text-[#ffd60a] mt-0.5">🏆 NY REKORD!</div>
          )}
        </div>
      </div>

      {/* History */}
      <div
        className="rounded-[18px] px-[18px] py-4 mb-3.5"
        style={{ background: "#111118", border: "1.5px solid rgba(255,255,255,0.063)" }}
      >
        <div className="text-xs font-bold text-[#55556a] uppercase tracking-wider mb-3">
          📋 Siste utfordringer
        </div>
        {profile.history.length === 0 ? (
          <div className="text-sm text-[#55556a] text-center py-3">
            Ingen utfordringer ennå.<br />Kom i gang! 🚀
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {profile.history.slice(0, 5).map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 pb-2"
                style={{ borderBottom: i < Math.min(profile.history.length, 5) - 1 ? "1px solid rgba(255,255,255,0.063)" : "none" }}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-snug truncate">{h.text}</div>
                  <div className="text-[11px] text-[#55556a] mt-0.5">{h.date} · +{h.pts} pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div
        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1 }}
        className="text-[rgba(235,235,245,0.8)] mb-2"
      >
        🏅 BADGES
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3.5">
        {BADGES.map((b) => {
          const earned = earnedBadgeIds.has(b.id);
          return (
            <div
              key={b.id}
              className="rounded-2xl py-4 px-3 text-center transition-all"
              style={{
                background: earned ? "rgba(255,214,10,.04)" : "#111118",
                border: `1.5px solid ${earned ? "rgba(255,214,10,.35)" : "rgba(255,255,255,0.063)"}`,
                opacity: earned ? 1 : 0.28,
                filter: earned ? "none" : "grayscale(95%)",
              }}
            >
              <span className="text-[28px] block mb-1.5">{b.em}</span>
              <div className="text-sm font-extrabold mb-0.5">{b.name}</div>
              <div className="text-[11px] text-[#55556a] leading-relaxed">{b.desc}</div>
              {earned && (
                <div className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#ffd60a] mt-1.5">
                  ✓ Opplåst
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pb-4">
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl font-bold text-[15px] active:scale-[0.97] transition-all"
          style={{
            background: "transparent",
            border: "1.5px solid rgba(255,45,85,.2)",
            color: "#ff2d55",
          }}
        >
          🚪 Logg ut
        </button>
      </div>
    </div>
  );
}
