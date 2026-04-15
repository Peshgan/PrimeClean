"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/tma/SplashScreen";
import Onboarding from "@/components/tma/Onboarding";
import BottomNav from "@/components/tma/BottomNav";
import HomeTab from "@/components/tma/tabs/HomeTab";
import ServicesTab from "@/components/tma/tabs/ServicesTab";
import OrderTab from "@/components/tma/tabs/OrderTab";
import ReviewsTab from "@/components/tma/tabs/ReviewsTab";
import ProfileTab from "@/components/tma/tabs/ProfileTab";
import { useTelegramWebApp } from "@/lib/tma/useTelegramWebApp";

type AppScreen = "splash" | "onboarding" | "main";
export type TabId = "home" | "services" | "order" | "reviews" | "profile";

const ONBOARDING_KEY = "pc_tma_onboarded";

export default function TMAPage() {
  const { webApp, user } = useTelegramWebApp();
  const [screen, setScreen] = useState<AppScreen>("splash");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [preselectedService, setPreselectedService] = useState<string>("");

  // After splash, decide: onboarding or main
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
    setActiveTab("order");
  };

  // Telegram back button: go back to home when not on home tab
  useEffect(() => {
    if (!webApp || screen !== "main") return;

    if (activeTab !== "home") {
      webApp.BackButton.show();
      const handler = () => setActiveTab("home");
      webApp.BackButton.onClick(handler);
      return () => webApp.BackButton.offClick(handler);
    } else {
      webApp.BackButton.hide();
    }
  }, [webApp, activeTab, screen]);

  if (screen === "splash") {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  if (screen === "onboarding") {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#F0FDFF" }}>
      {/* Tab content — fills the space above the bottom nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: "72px" }}>
        {activeTab === "home" && (
          <HomeTab user={user} onGoToOrder={goToOrder} onTabChange={setActiveTab} />
        )}
        {activeTab === "services" && <ServicesTab onGoToOrder={goToOrder} />}
        {activeTab === "order" && (
          <OrderTab
            user={user}
            preselectedService={preselectedService}
            onServiceChange={setPreselectedService}
          />
        )}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "profile" && <ProfileTab user={user} webApp={webApp} />}
      </div>

      {/* Fixed bottom navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
