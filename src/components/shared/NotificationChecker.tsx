"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types/database";

export function NotificationChecker() {
  useEffect(() => {
    checkNotifications();
  }, []);

  async function checkNotifications() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, data, read, created_at")
      .eq("user_id", user.id)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!notifications || notifications.length === 0) return;

    const notifs = notifications as unknown as Notification[];

    // Show toasts for unread notifications
    for (const notif of notifs) {
      setTimeout(() => {
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
      }, 500);
    }

    // Mark all as read
    const ids = notifs.map((n) => n.id);
    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", ids);
  }

  return null;
}
