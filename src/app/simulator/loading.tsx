// Matches the simulator's layout so nothing jumps when it loads.
export default function Loading() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6" aria-busy="true" aria-label="Loading the simulator">
      <div className="flex flex-col gap-3">
        <div className="skeleton h-12 w-64" />
        <div className="skeleton h-4 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          {[5, 7].map((rows, i) => (
            <div key={i} className="card flex flex-col gap-4 p-5">
              <div className="skeleton h-5 w-24" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: rows - 1 }, (_, j) => (
                  <div key={j} className="flex flex-col gap-1.5">
                    <div className="skeleton h-3 w-16" />
                    <div className="skeleton h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="skeleton h-12 w-full" />
          <div className="card p-2">
            <div className="skeleton aspect-[16/9] w-full" />
          </div>
          <div className="skeleton h-16 w-full" />
        </div>
      </div>
    </main>
  );
}
