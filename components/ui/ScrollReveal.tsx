"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
