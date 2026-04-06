import { PasswordGate } from "@/components/password-gate";
import { RewriteShell } from "@/components/rewrite-shell";

export default function Home() {
  return (
    <PasswordGate>
      <RewriteShell />
    </PasswordGate>
  );
}
