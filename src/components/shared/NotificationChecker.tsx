"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types/database";

export function NotificationChecker() {
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userIdRef.current = user.id;

      // Check existing unread notifications on mount
      await checkAndShow(user.id);

      // Subscribe to new notifications via realtime
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const notif = payload.new as Notification;
            if (notif.read) return;
            showToast(notif);
            // Mark as read
            await supabase
              .from("notifications")
              .update({ read: true })
              .eq("id", notif.id);
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function checkAndShow(userId: string) {
    const supabase = createClient();
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, data, read, created_at")
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!notifications || notifications.length === 0) return;

    const notifs = notifications as unknown as Notification[];
    for (const notif of notifs) {
      setTimeout(() => showToast(notif), 600);
    }

    const ids = notifs.map((n) => n.id);
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  }

  function showToast(notif: Notification) {
    if (notif.type === "group_complete") {
      toast.success(`${notif.title} +${notif.data?.pts ?? 10} pts`, {
        description: notif.body,
        duration: 5000,
      });
    } else if (notif.type === "group_invite") {
      toast.info(notif.title, {
        description: notif.body,
        duration: 5000,
      });
    } else {
      toast(notif.title, {
        description: notif.body,
        duration: 4000,
      });
    }
  }

  return null;
}
