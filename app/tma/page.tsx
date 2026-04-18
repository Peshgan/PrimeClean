"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/tma/SplashScreen";
import Onboarding from "@/components/tma/Onboarding";
import TMABubbles from "@/components/tma/TMABubbles";
import BottomNav from "@/components/tma/BottomNav";
import HomeTab from "@/components/tma/tabs/HomeTab";
import ServicesTab from "@/components/tma/tabs/ServicesTab";
import OrderTab from "@/components/tma/tabs/OrderTab";
import ReviewsTab from "@/components/tma/tabs/ReviewsTab";
import ProfileTab from "@/components/tma/tabs/ProfileTab";
import AdminTab from "@/components/tma/tabs/AdminTab";
import SupportFAB from "@/components/tma/SupportFAB";
import { useTelegramWebApp } from "@/lib/tma/useTelegramWebApp";

type AppScreen = "splash" | "onboarding" | "main";
export type TabId = "home" | "services" | "order" | "reviews" | "profile" | "admin";

const ONBOARDING_KEY = "pc_tma_onboarded";

export default function TMAPage() {
  const { webApp, user } = useTelegramWebApp();
  const [screen, setScreen] = useState<AppScreen>("splash");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [prevTab, setPrevTab] = useState<TabId>("home");
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  // Check admin status once user is known
  useEffect(() => {
    if (!user?.id || adminChecked) return;
    setAdminChecked(true);
    fetch(`/api/admin/tma?tgId=${user.id}&action=check`)
      .then((r) => r.json())
      .then((d) => { if (d.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, [user, adminChecked]);

  // Lock the Telegram viewport and disable any zoom / swipe collapse
  useEffect(() => {
    if (!webApp) return;
    try {
      webApp.ready();
      webApp.expand();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = webApp as any;
      w.disableVerticalSwipes?.();
      w.requestFullscreen?.();
      w.lockOrientation?.();
    } catch {}

    // Extra safety: prevent pinch / double-tap zoom on iOS/Android WebView
    const blockGesture = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", blockGesture as EventListener);
    document.addEventListener("gesturechange", blockGesture as EventListener);
    document.addEventListener("gestureend", blockGesture as EventListener);

    let lastTouch = 0;
    const blockDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouch < 350) e.preventDefault();
      lastTouch = now;
    };
    document.addEventListener("touchend", blockDoubleTap, { passive: false });

    const blockMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", blockMultiTouch, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", blockGesture as EventListener);
      document.removeEventListener("gesturechange", blockGesture as EventListener);
      document.removeEventListener("gestureend", blockGesture as EventListener);
      document.removeEventListener("touchend", blockDoubleTap);
      document.removeEventListener("touchmove", blockMultiTouch);
    };
  }, [webApp]);

  const handleSplashDone = () => {
    const seen = typeof window !== "undefined" && localStorage.getItem(ONBOARDING_KEY);
    setScreen(seen ? "main" : "onboarding");
  };

  const handleOnboardingDone = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "1");
    }
    setScreen("main");
  };

  const goToOrder = (serviceSlug?: string) => {
    if (serviceSlug) setPreselectedService(serviceSlug);
    setPrevTab(activeTab);
    setActiveTab("order");
  };

  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab) return;
    try { webApp?.hapticFeedback?.selectionChanged?.(); } catch {}
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  // Telegram back button
  useEffect(() => {
    if (!webApp || screen !== "main") return;
    if (activeTab !== "home") {
      webApp.BackButton.show();
      const handler = () => { setPrevTab(activeTab); setActiveTab("home"); };
      webApp.BackButton.onClick(handler);
      return () => webApp.BackButton.offClick(handler);
    } else {
      webApp.BackButton.hide();
    }
  }, [webApp, activeTab, screen]);

  if (screen === "splash") return <SplashScreen onDone={handleSplashDone} />;
  if (screen === "onboarding") return <Onboarding onDone={handleOnboardingDone} />;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .tab-content { animation: slideInRight 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#F0FDFF", position: "relative" }}>
        <TMABubbles />
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: "72px" }}>
          <div key={`${activeTab}-${prevTab}`} className="tab-content">
            {activeTab === "home" && (
              <HomeTab user={user} onGoToOrder={goToOrder} onTabChange={handleTabChange} />
            )}
            {activeTab === "services" && <ServicesTab onGoToOrder={goToOrder} />}
            {activeTab === "order" && (
              <OrderTab
                user={user}
                preselectedService={preselectedService}
                onServiceChange={setPreselectedService}
              />
            )}
            {activeTab === "reviews" && <ReviewsTab user={user} />}
            {activeTab === "profile" && <ProfileTab user={user} webApp={webApp} />}
            {activeTab === "admin" && isAdmin && user?.id && (
              <AdminTab tgId={String(user.id)} />
            )}
          </div>
        </div>

        <BottomNav active={activeTab} onChange={handleTabChange} isAdmin={isAdmin} />
        <SupportFAB />
      </div>
    </>
  );
}
