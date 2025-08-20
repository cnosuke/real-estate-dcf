import { Outlet } from 'react-router'

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-3 py-3 sm:px-4 lg:px-6">
        <Outlet />
      </main>
    </div>
  )
}
