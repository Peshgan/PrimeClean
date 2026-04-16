import { NextRequest, NextResponse } from "next/server";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "primeclean2024";

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();

    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      // Simple session cookie — HttpOnly, 8h
      response.cookies.set("admin_session", "1", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return response;
}
