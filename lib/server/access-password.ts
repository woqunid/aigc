import "server-only";

import { timingSafeEqual } from "node:crypto";

export class AccessPasswordConfigError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AccessPasswordConfigError";
    this.status = status;
  }
}

function getAccessPassword() {
  const accessPassword = process.env.ACCESS_PASSWORD;

  if (!accessPassword) {
    throw new AccessPasswordConfigError(
      "服务端未配置 ACCESS_PASSWORD，请先在环境变量中设置访问密码。",
    );
  }

  return accessPassword;
}

export function verifyAccessPassword(password: string) {
  const expectedPassword = Buffer.from(getAccessPassword(), "utf8");
  const actualPassword = Buffer.from(password, "utf8");

  if (expectedPassword.length !== actualPassword.length) {
    return false;
  }

  return timingSafeEqual(expectedPassword, actualPassword);
}
