import { Button } from "@/components/ui/button"
import { Package, Shield, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">StudioSphere</span>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-balance text-5xl font-bold tracking-tight lg:text-6xl">
          Professional Equipment Management
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            For Creative Studios
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
          StudioSphere provides comprehensive inventory control for photography and videography studios. Track
          equipment, manage team access, and maintain complete accountability with enterprise-grade tools.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/auth/signup">Start Free Trial</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border hover:bg-card bg-transparent">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-center shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Equipment Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comprehensive database with serial numbers, purchase info, and real-time condition tracking
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-center shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Team Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Owner-controlled permissions for employees with customizable access
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-center shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold">Approval Workflow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automated approval process for equipment requests and return management
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-center shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <h3 className="text-xl font-semibold">Analytics & Reports</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Export to Excel, view usage history, and track equipment performance metrics
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StudioSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
