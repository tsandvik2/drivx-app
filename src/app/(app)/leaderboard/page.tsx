"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/app-store";
import { LoadingDots } from "@/components/shared/LoadingDots";

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  pts: number;
  streak: number;
  done_count: number;
  weekly_pts?: number;
}

export default function LeaderboardPage() {
  const profile = useAppStore((s) => s.profile);
  const [tab, setTab] = useState<"friends" | "week" | "all">("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function fetchLeaderboard() {
    setLoading(true);
    const supabase = createClient();

    if (tab === "all") {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, pts, streak, done_count")
        .order("pts", { ascending: false })
        .limit(20);
      setEntries(data ?? []);

    } else if (tab === "friends") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setEntries([]); setLoading(false); return; }

      const { data: friendships } = await supabase
        .from("friendships")
        .select("to_user_id")
        .eq("from_user_id", user.id)
        .eq("status", "accepted");

      const friendIds = (friendships ?? []).map((f: { to_user_id: string }) => f.to_user_id);
      const allIds = [user.id, ...friendIds];

      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, pts, streak, done_count")
        .in("id", allIds)
        .order("pts", { ascending: false });
      setEntries(data ?? []);

    } else if (tab === "week") {
      // Fetch completions from last 7 days and aggregate per user
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: completions } = await supabase
        .from("completions")
        .select("user_id, pts_earned")
        .gte("completed_at", weekAgo);

      if (!completions || completions.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      // Aggregate weekly pts per user
      const weeklyMap: Record<string, number> = {};
      for (const c of completions as Array<{ user_id: string; pts_earned: number }>) {
        weeklyMap[c.user_id] = (weeklyMap[c.user_id] ?? 0) + c.pts_earned;
      }
      const topIds = Object.keys(weeklyMap)
        .sort((a, b) => weeklyMap[b] - weeklyMap[a])
        .slice(0, 20);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, pts, streak, done_count")
        .in("id", topIds);

      const enriched = (profiles ?? []).map((p: LeaderboardEntry) => ({
        ...p,
        weekly_pts: weeklyMap[p.id] ?? 0,
      })).sort((a: LeaderboardEntry, b: LeaderboardEntry) => (b.weekly_pts ?? 0) - (a.weekly_pts ?? 0));
      setEntries(enriched);
    }

    setLoading(false);
  }

  const tabs = [
    { id: "friends" as const, label: "Venner" },
    { id: "week" as const, label: "Denne uken" },
    { id: "all" as const, label: "Alle tider" },
  ];

  const displayPts = (entry: LeaderboardEntry) =>
    tab === "week" ? (entry.weekly_pts ?? 0) : entry.pts;

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumOrder = podium.length >= 3
    ? [podium[1], podium[0], podium[2]]
    : podium;

  const podiumHeights = [70, 100, 55];
  const podiumColors = ["#00f0ff", "#ffd60a", "#ff6b00"];

  return (
    <div style={{ animation: "slideUp 0.32s cubic-bezier(0.16,1,0.3,1)" }}>
      <div className="pt-12 pb-2">
        <div
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 2 }}
          className="text-white"
        >
          🏆 RANGLISTE
        </div>
        <div className="text-sm text-[#55556a] font-medium">Hvem er kongen av utfordringer?</div>
      </div>

      {/* Hero */}
      <div
        className="rounded-[20px] p-5 text-center mb-3.5"
        style={{ background: "linear-gradient(135deg, #111118, #161622)", border: "1.5px solid rgba(255,255,255,0.063)" }}
      >
        <div
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 2 }}
          className="mb-0.5"
        >
          🏆 TOPP SPILLERE
        </div>
        <div className="text-xs text-[#55556a]">Konkurrér om #1 plassen!</div>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-2xl p-[3px] gap-[3px] mb-3.5"
        style={{ background: "#111118", border: "1.5px solid rgba(255,255,255,0.063)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 rounded-[11px] border-none text-sm font-bold transition-all"
            style={{
              background: tab === t.id ? "#ff2d55" : "transparent",
              color: tab === t.id ? "#fff" : "#55556a",
              fontFamily: "var(--font-jakarta), sans-serif",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingDots text="Laster rangliste..." />
      ) : (
        <>
          {entries.length === 0 ? (
            <div className="text-center text-[#55556a] py-12 text-sm">
              {tab === "friends"
                ? "Legg til venner for å se dem her! 👯"
                : tab === "week"
                  ? "Ingen utfordringer fullført denne uken ennå. Vær den første! 🚀"
                  : "Ingen spillere ennå. Vær den første! 🚀"}
            </div>
          ) : (
            <>
              {/* Podium */}
              {podium.length >= 3 && (
                <div className="flex items-end justify-center gap-2.5 py-4 pb-1.5">
                  {podiumOrder.map((entry, idx) => {
                    const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                    const height = podiumHeights[idx];
                    const color = podiumColors[idx];
                    return (
                      <div key={entry.id} className="flex flex-col items-center gap-1.5">
                        <div
                          className="rounded-full flex items-center justify-center border-2"
                          style={{
                            width: rank === 1 ? 62 : 46,
                            height: rank === 1 ? 62 : 46,
                            fontSize: rank === 1 ? 30 : 22,
                            borderColor: color,
                            background: "#111118",
                            boxShadow: rank === 1 ? `0 0 22px ${color}47` : "none",
                          }}
                        >
                          {entry.avatar_url ?? "🔥"}
                        </div>
                        <div className="text-xs font-bold text-[rgba(235,235,245,0.8)] max-w-[70px] truncate text-center">
                          {entry.username}
                        </div>
                        <div
                          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: "#ffd60a" }}
                        >
                          {displayPts(entry)}
                        </div>
                        <div
                          className="rounded-t-lg w-14"
                          style={{ height, background: `${color}28`, border: `1px solid ${color}50` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List */}
              <div className="flex flex-col gap-2 mt-2">
                {entries.map((entry, i) => {
                  const isMe = entry.username === profile.name;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-2xl py-3.5 px-3.5"
                      style={{
                        background: isMe ? "rgba(255,45,85,.06)" : "#111118",
                        border: `1.5px solid ${isMe ? "#ff2d55" : "rgba(255,255,255,0.063)"}`,
                      }}
                    >
                      <div
                        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#55556a" }}
                        className="w-6.5 text-center"
                      >
                        {i + 1}
                      </div>
                      <div className="text-[26px] w-9 text-center">
                        {entry.avatar_url ?? "🔥"}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold">
                          {entry.username} {isMe && <span className="text-[#ff2d55] text-xs">← deg</span>}
                        </div>
                        <div className="text-[11px] text-[#55556a] font-semibold mt-0.5">
                          {entry.done_count} fullført · {entry.streak} streak 🔥
                        </div>
                      </div>
                      <div
                        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#ffd60a" }}
                      >
                        {displayPts(entry)}
                        {tab === "week" && <span className="text-[11px] text-[#55556a] font-normal"> uke</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
