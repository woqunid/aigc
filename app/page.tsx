import { PasswordGate } from "@/components/password-gate";
import { RewriteStudio } from "@/components/rewrite-studio";

export default function Home() {
  return (
    <PasswordGate>
      <RewriteStudio />
    </PasswordGate>
  );
}
