"use client";

import { useState } from "react";
import type { SelectedFriend } from "@/store/app-store";

interface PunishmentScreenProps {
  punishment: string;
  participants: SelectedFriend[];
  hostName: string;
  onConfirm: (loserId: string | null) => void;
  onSkip: () => void;
}

export function PunishmentScreen({ punishment, participants, hostName, onConfirm, onSkip }: PunishmentScreenProps) {
  const [selectedLoser, setSelectedLoser] = useState<string | null>(null);
  const [showPunishment, setShowPunishment] = useState(false);

  // All players: host + participants
  const allPlayers = [
    { id: "host", username: hostName, emoji: "👑" },
    ...participants,
  ];

  function handleSelectLoser(id: string) {
    setSelectedLoser(id);
    // Show punishment with dramatic delay
    setTimeout(() => setShowPunishment(true), 300);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-[750]"
      style={{ background: "rgba(0,0,0,.95)", backdropFilter: "blur(20px)" }}
    >
      <div
        className="rounded-[28px] p-7 w-full max-w-sm text-center relative overflow-hidden"
        style={{
          background: "#111118",
          border: "1.5px solid rgba(255,45,85,.3)",
          animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div className="rainbow-stripe absolute top-0 left-0 right-0" />

        {!showPunishment ? (
          <>
            <div className="text-[48px] mb-2 mt-2">😈</div>
            <div
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2, lineHeight: 1.1 }}
              className="text-[#ff2d55] mb-1"
            >
              HVEM TAPTE?
            </div>
            <div className="text-sm text-[#55556a] mb-5">
              Velg taperen som må ta straffen
            </div>

            <div className="flex flex-col gap-2.5">
              {allPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectLoser(player.id)}
                  className="flex items-center gap-3 rounded-2xl py-4 px-4 transition-all active:scale-[0.95] w-full"
                  style={{
                    background: selectedLoser === player.id
                      ? "linear-gradient(135deg, rgba(255,45,85,.15), rgba(255,107,0,.08))"
                      : "rgba(255,255,255,.03)",
                    border: selectedLoser === player.id
                      ? "1.5px solid rgba(255,45,85,.5)"
                      : "1.5px solid rgba(255,255,255,0.063)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "#161622" }}
                  >
                    {player.emoji}
                  </div>
                  <div className="text-base font-extrabold text-left">{player.username}</div>
                </button>
              ))}
            </div>

            <button
              onClick={onSkip}
              className="w-full mt-4 py-3 rounded-2xl font-bold text-sm text-[#55556a] active:scale-[0.97]"
              style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.063)" }}
            >
              Hopp over straff
            </button>
          </>
        ) : (
          <div style={{ animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <div className="text-[64px] mb-2 mt-2">💀</div>
            <div
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1 }}
              className="text-[#ff2d55] mb-1"
            >
              STRAFF FOR{" "}
              <span className="text-white">
                {allPlayers.find((p) => p.id === selectedLoser)?.username ?? "Taperen"}
              </span>
            </div>

            <div
              className="rounded-2xl py-5 px-4 mt-4 mb-5"
              style={{
                background: "rgba(255,45,85,.06)",
                border: "1.5px solid rgba(255,45,85,.25)",
              }}
            >
              <div className="text-lg font-bold leading-snug text-white">
                {punishment}
              </div>
            </div>

            <button
              onClick={() => onConfirm(selectedLoser === "host" ? null : selectedLoser)}
              className="w-full py-[17px] rounded-2xl font-extrabold text-base active:scale-[0.97] transition-all"
              style={{
                background: "linear-gradient(135deg, #ff2d55, #ff6b00)",
                color: "#fff",
                boxShadow: "0 8px 32px rgba(255,45,85,0.45)",
              }}
            >
              Straff utført! ✓
            </button>
            <button
              onClick={() => onConfirm(selectedLoser === "host" ? null : selectedLoser)}
              className="w-full mt-2 py-3 rounded-2xl font-bold text-sm text-[#55556a] active:scale-[0.97]"
              style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.063)" }}
            >
              Gå videre uten å fullføre straff
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
