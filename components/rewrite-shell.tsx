"use client";

import { useState } from "react";
import { ModeSelector } from "@/components/mode-selector";
import { RewriteStudio } from "@/components/rewrite-studio";
import { type RewriteMode } from "@/lib/rewrite-mode";

export function RewriteShell() {
  const [selectedMode, setSelectedMode] = useState<RewriteMode | null>(null);

  if (!selectedMode) {
    return (
      <ModeSelector
        onSelectMode={(mode) => {
          setSelectedMode(mode);
        }}
      />
    );
  }

  return (
    <RewriteStudio
      rewriteMode={selectedMode}
      onBackToModeSelect={() => {
        setSelectedMode(null);
      }}
    />
  );
}
