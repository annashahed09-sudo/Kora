/**
 * Small keyboard-shortcut pill used in the sidebar search trigger and
 * elsewhere. Renders as a single rounded rect per key with a tailwind
 * muted border.
 */
export function KbdHint({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] text-fg-subtle">
      {keys.map((k, i) => (
        <span
          key={`${k}-${i}`}
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-line bg-bg px-1.5 text-[10px] text-fg-muted"
        >
          {k}
        </span>
      ))}
    </span>
  );
}
