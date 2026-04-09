import { NextResponse } from "next/server";
import {
  AccessPasswordConfigError,
  verifyAccessPassword,
} from "@/lib/server/access-password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VerifyPasswordRequest = {
  password?: unknown;
};

export async function POST(request: Request) {
  let body: VerifyPasswordRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体必须是合法的 JSON。" },
      { status: 400 },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json({ error: "请输入密码。" }, { status: 400 });
  }

  try {
    if (!verifyAccessPassword(password)) {
      return NextResponse.json(
        { error: "密码错误，请重试。" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AccessPasswordConfigError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "密码验证失败，请稍后重试。" },
      { status: 500 },
    );
  }
}
