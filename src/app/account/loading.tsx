export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-16 sm:py-20" aria-busy="true" aria-label="Loading your account">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-10 w-56" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="skeleton h-10 w-44" />
      </div>
      <div className="card divide-y divide-line">
        <div className="flex justify-between p-6">
          <div className="skeleton h-4 w-12" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="flex flex-col gap-5 p-6">
          <div className="skeleton h-5 w-20" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="skeleton h-11 w-full" />
            <div className="skeleton h-11 w-full" />
          </div>
          <div className="skeleton h-10 w-32" />
        </div>
      </div>
    </main>
  );
}
