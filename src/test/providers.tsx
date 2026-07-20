import type { ReactNode } from "react";
import { AudioProvider } from "../audio";
import { ProgressProvider } from "../progress";

export function AppTestProviders({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider>
      <AudioProvider>{children}</AudioProvider>
    </ProgressProvider>
  );
}
