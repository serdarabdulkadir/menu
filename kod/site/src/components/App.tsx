"use client";
import { LayoutGroup, MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { useEffect, useRef } from "react";
import { startLive } from "@/lib/live";
import { Provider, useApp } from "./store";
import { Intro } from "./Intro";
import { Wall } from "./Wall";
import { BoardPage } from "./BoardPage";
import { TablePage, ShowPage } from "./TablePage";
import { ProductDrawer } from "./ProductDrawer";
import { SearchDrawer } from "./SearchDrawer";
import { InfoSheet } from "./InfoSheet";

function Screens() {
  const { view, infoOpen, setInfoOpen } = useApp();
  const wallRef = useRef<HTMLDivElement>(null);
  const intro = view.name === "intro";
  // Intro bitince "içeri yaklaşma" ölçeğini temizle
  useEffect(() => { if (!intro && wallRef.current) wallRef.current.style.transform = ""; }, [intro]);
  return (
    <LayoutGroup>
      {(intro || view.name === "wall") && (
        // Intro sırasında Wall altta, viewport boyutlu sabit kutuda durur (içindeki fixed çubuk doğru yerde kalsın); aynı ağaç konumu: yeniden mount olmaz
        <div ref={wallRef} aria-hidden={intro || undefined} inert={intro} className={intro ? "fixed inset-0 overflow-hidden" : undefined}>
          <Wall />
        </div>
      )}
      {intro && <Intro wallRef={wallRef} />}
      {view.name === "board" && <BoardPage id={view.id} />}
      {view.name === "table" && <TablePage />}
      {view.name === "show" && <ShowPage />}
      <ProductDrawer />
      <SearchDrawer />
      <InfoSheet open={infoOpen} onOpenChange={setInfoOpen} />
    </LayoutGroup>
  );
}

export default function App() {
  useEffect(() => { startLive(); }, []);
  return (
    <MotionConfig reducedMotion="user">

        <Provider>
          <Screens />
          <Toaster
            position="bottom-center" theme="light" visibleToasts={1} duration={1800}
            offset={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
            mobileOffset={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
            toastOptions={{ classNames: {
              toast: "!rounded-[10px] !border !border-ink/15 !bg-paper !text-ink !shadow-[0_6px_24px_-8px_rgba(30,22,14,0.25)] !font-sans",
              actionButton: "!bg-ink !text-paper",
            } }}
          />
        </Provider>

    </MotionConfig>
  );
}
