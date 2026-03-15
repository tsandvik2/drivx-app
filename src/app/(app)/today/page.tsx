"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getDailyChallenge } from "@/lib/challenges/data";
import { toast } from "sonner";

export default function TodayPage() {
  const router = useRouter();
  const { profile, setProfile } = useAppStore();

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const isDone = profile.dailyDone && profile.dailyDate === today;
  const streakInDanger = profile.streak > 0 && profile.dailyDate === yesterday && !isDone;

  const dailyChallenge = getDailyChallenge();

  function markDailyDone() {
    setProfile({ dailyDone: true, dailyDate: today, pts: profile.pts + 5 });
    toast.success("Dagens utfordring fullført! +5 pts 🎉");
  }

  const isWednesday = new Date().getDay() === 3;
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

  return (
    <div style={{ animation: "slideUp 0.32s cubic-bezier(0.16,1,0.3,1)" }}>
      <div className="pt-12 pb-2">
        <div
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 2 }}
          className="text-white"
        >
          DAGENS
        </div>
        <div className="text-sm text-[#55556a] font-medium">Én utfordring per dag</div>
      </div>

      {/* Streak danger banner */}
      {streakInDanger && (
        <div
          className="rounded-2xl p-3.5 flex gap-3 items-center mb-3.5 relative overflow-hidden"
          style={{
            background: "rgba(255,214,10,0.06)",
            border: "1.5px solid rgba(255,214,10,0.35)",
          }}
        >
          <span className="text-[26px] flex-shrink-0" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>⚠️</span>
          <div>
            <div className="text-sm font-extrabold text-[#ffd60a] mb-0.5">
              Streaken din er i fare!
            </div>
            <div className="text-xs text-[#55556a] leading-relaxed">
              Du er på {profile.streak} dager. Fullfør en utfordring nå for å beholde streaken! 🔥
            </div>
          </div>
        </div>
      )}

      {/* Daily challenge */}
      <div
        className="rounded-[18px] px-[18px] py-4 relative overflow-hidden mb-3.5"
        style={{
          background: "#111118",
          border: "1.5px solid rgba(255,255,255,0.063)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: "linear-gradient(180deg, #ff2d55, #ff6b00)" }}
        />
        <div className="flex items-center justify-between mb-2 pl-2">
          <div className="text-[10px] font-extrabold tracking-widest uppercase text-[#ff2d55]">
            📅 Dagens utfordring
          </div>
          <div className="text-[11px] font-bold text-[#55556a] bg-white/5 rounded-lg px-2.5 py-0.5">
            {new Date().toLocaleDateString("no", { weekday: "long", day: "numeric", month: "short" })}
          </div>
        </div>
        <div className="text-sm font-bold leading-relaxed mb-3 pl-2">
          {dailyChallenge.text}
        </div>
        {isDone ? (
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#00e676] pl-2">
            ✓ Fullført i dag!
          </div>
        ) : (
          <button
            onClick={markDailyDone}
            className="rounded-[10px] px-4 py-2 text-sm font-extrabold text-white active:scale-[0.97] transition-all ml-2"
            style={{ background: "linear-gradient(135deg, #ff2d55, #ff6b00)" }}
          >
            ✓ Marker fullført
          </button>
        )}
      </div>

      {/* Special banners */}
      {isWednesday && (
        <div
          className="rounded-2xl p-3 flex gap-2.5 items-center cursor-pointer transition-all active:scale-[0.97] relative overflow-hidden mb-3.5"
          style={{
            background: "rgba(191,90,242,0.05)",
            border: "1px solid rgba(191,90,242,0.12)",
          }}
        >
          <div className="spec-shine" />
          <span className="text-[22px] flex-shrink-0">🌙</span>
          <div>
            <div
              className="inline-block text-[10px] font-extrabold tracking-widest uppercase rounded-full px-2.5 py-0.5 mb-1"
              style={{ background: "rgba(191,90,242,.2)", color: "#bf5af2" }}
            >
              Onsdag Mystisk
            </div>
            <div className="text-sm font-bold mb-0.5">Midtukens magi ✨</div>
            <div className="text-[11px] text-[#55556a]">Spesielle utfordringer tilgjengelig</div>
          </div>
        </div>
      )}

      {isWeekend && (
        <div
          className="rounded-2xl p-3 flex gap-2.5 items-center cursor-pointer transition-all active:scale-[0.97] relative overflow-hidden mb-3.5"
          style={{
            background: "rgba(255,214,10,0.04)",
            border: "1px solid rgba(255,214,10,0.12)",
          }}
        >
          <div className="spec-shine" />
          <span className="text-[22px] flex-shrink-0">🔥</span>
          <div>
            <div
              className="inline-block text-[10px] font-extrabold tracking-widest uppercase rounded-full px-2.5 py-0.5 mb-1"
              style={{ background: "rgba(255,214,10,.18)", color: "#ffd60a" }}
            >
              Weekend Mode 🔥
            </div>
            <div className="text-sm font-bold mb-0.5">Doble poeng i helgen!</div>
            <div className="text-[11px] text-[#55556a]">Alle utfordringer gir 2× pts</div>
          </div>
        </div>
      )}

      {/* Start challenge CTA */}
      <button
        onClick={() => router.push("/home")}
        className="w-full py-4 rounded-2xl font-extrabold text-white text-base active:scale-[0.97] transition-all mb-3.5"
        style={{
          background: "linear-gradient(135deg, #ff2d55, #ff6b00)",
          boxShadow: "0 8px 32px rgba(255,45,85,0.35)",
        }}
      >
        🎯 Start ny utfordring
      </button>

      {/* Weekly summary */}
      <div
        className="rounded-[18px] px-[18px] py-4"
        style={{ background: "#111118", border: "1.5px solid rgba(255,255,255,0.063)" }}
      >
        <div className="text-xs font-bold text-[#55556a] uppercase tracking-wider mb-3">
          📊 Din statistikk
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Fullført", value: profile.done, icon: "🎯" },
            { label: "Streak", value: `${profile.streak} 🔥`, icon: "⚡" },
            { label: "Poeng", value: profile.pts, icon: "⭐" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl py-3 px-2 text-center"
              style={{ background: "#161622" }}
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <div
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}
                className="text-white"
              >
                {stat.value}
              </div>
              <div className="text-[10px] text-[#55556a] font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
