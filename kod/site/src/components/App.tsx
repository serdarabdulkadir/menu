"use client";
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
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
  return (
    <LayoutGroup>
      <AnimatePresence mode="wait">
        {view.name === "intro" && <Intro key="intro" />}
      </AnimatePresence>
      {view.name === "wall" && <Wall />}
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
  return (
    <MotionConfig reducedMotion="user">

        <Provider>
          <Screens />
        </Provider>

    </MotionConfig>
  );
}
