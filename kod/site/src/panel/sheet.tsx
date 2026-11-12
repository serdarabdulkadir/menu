"use client";
// Vaul tabanlı ortak sayfa: mobilde alttan, masaüstünde (lg+) sağdan açılır.
import { Drawer } from "vaul";
import { useDesktop } from "./data";
import { Icon } from "./icons";
import { cx } from "./ui";

export function Sheet({ open, onClose, title, desc, footer, children, wide }: {
  open: boolean; onClose: () => void; title: string; desc?: string; footer?: React.ReactNode; children: React.ReactNode; wide?: boolean;
}) {
  const desktop = useDesktop();
  return (
    <Drawer.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }} direction={desktop ? "right" : "bottom"}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Drawer.Content
          className={cx(
            "fixed z-50 flex flex-col bg-paper text-ink outline-none",
            desktop ? cx("inset-y-0 right-0 border-l border-ink/10", wide ? "w-[560px]" : "w-[460px]") : "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[18px] border-t border-ink/10",
          )}
        >
          {!desktop && <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/20" />}
          <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
            <div>
              <Drawer.Title className="font-serif text-[26px] leading-none">{title}</Drawer.Title>
              {desc ? <Drawer.Description className="mt-1.5 text-[13.5px] text-mut">{desc}</Drawer.Description> : <Drawer.Description className="sr-only">{title}</Drawer.Description>}
            </div>
            <button type="button" onClick={onClose} aria-label="Kapat" className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-mut hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak/60">
              <Icon name="close" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5" data-vaul-no-drag>{children}</div>
          {footer && <div className="flex shrink-0 items-center justify-end gap-2 border-t border-ink/10 bg-paper px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</div>}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
