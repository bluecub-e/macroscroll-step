import Desktop from "@/components/ui/Desktop";
import { GameProvider } from "@/contexts/GameContext";

export default function Home() {
  return (
    <main>
      <GameProvider>
        <Desktop />
      </GameProvider>
    </main>
  );
}
