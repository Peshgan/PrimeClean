import { NextResponse } from "next/server";
import { services } from "@/lib/data/services";

export async function GET() {
  // Return a lightweight version of services for the API
  const slim = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    shortTitle: s.shortTitle,
    description: s.description,
    icon: s.icon,
    image: s.image,
    priceFrom: s.priceFrom,
    duration: s.duration,
  }));

  return NextResponse.json({ services: slim });
}
