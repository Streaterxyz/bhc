/**
 * Instant loading state for the whole /app tools workspace.
 *
 * Next streams this prefetched skeleton the moment a link is clicked, so
 * navigating between tools feels immediate instead of hanging on the old
 * screen while the destination's per-request DB work finishes. The /app
 * layout (header + theme) stays mounted across sibling navigations, so this
 * only replaces the page content area.
 */
function Block({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-bg-elevated ${className ?? ""}`}
    />
  );
}

export default function AppLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:py-14" aria-busy="true">
      <span className="sr-only">Loading…</span>

      {/* Title row */}
      <div className="mb-10 space-y-3">
        <Block className="h-3 w-24" />
        <Block className="h-9 w-64" />
        <Block className="h-4 w-80" />
      </div>

      {/* Three stat cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Block className="h-36" />
        <Block className="h-36" />
        <Block className="h-36" />
      </div>

      {/* List rows */}
      <Block className="mb-5 h-5 w-48" />
      <div className="grid gap-3">
        <Block className="h-20" />
        <Block className="h-20" />
        <Block className="h-20" />
        <Block className="h-20" />
      </div>
    </main>
  );
}
