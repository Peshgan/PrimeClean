"use client";

import { useEffect, useState } from "react";
import type { TelegramWebApp, TelegramUser } from "@/types/telegram";

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user ?? null);
    }
    setIsReady(true);
  }, []);

  return { webApp, user, isReady };
}
