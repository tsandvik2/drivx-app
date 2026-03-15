"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function StreakGuard() {
  const validateStreak = useAppStore((s) => s.validateStreak);

  useEffect(() => {
    validateStreak();
  }, [validateStreak]);

  return null;
}
