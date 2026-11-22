export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="h-8 w-52 animate-pulse rounded bg-cream-200" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded bg-cream-200/70" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card overflow-hidden">
            <div className="aspect-[16/10] animate-pulse bg-cream-200" />
            <div className="space-y-2 p-3.5">
              <div className="h-3 w-24 animate-pulse rounded bg-cream-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-cream-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-cream-200/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
