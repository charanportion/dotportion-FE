import { Bell, Search } from "lucide-react"

export function Navbar() {
  return (
    <header className="border-b h-14 flex items-center px-4 justify-between">
      <h1 className="text-xl font-semibold">Visual API Builder</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-input bg-background px-8 text-sm"
          />
        </div>
        <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-accent">
          <Bell className="h-5 w-5" />
        </button>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="text-sm font-medium">JS</span>
        </div>
      </div>
    </header>
  )
}
