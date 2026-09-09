import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import mascotImg from '@assets/IMG_1398_1784529128566.jpeg';
import { Button } from '@/components/ui/button';

export const INVITE_LINK =
  'https://discord.com/oauth2/authorize?client_id=1528553228956864592&permissions=8&scope=bot%20applications.commands';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/status', label: 'Status' },
  { href: '/faq', label: 'FAQ' },
  { href: '/support', label: 'Support' },
];

function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30 group-hover:border-primary/60 transition-colors">
            <img src={mascotImg} alt="Slither Music Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-white">SLITHER MUSIC</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${
                location === href
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="hidden md:inline-flex">
            <a href={INVITE_LINK} target="_blank" rel="noreferrer">Add to Discord</a>
          </Button>
          <button
            className="md:hidden text-muted-foreground hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-md">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium transition-colors ${
                  location === href ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
            <a
              href={INVITE_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-primary text-white text-sm font-semibold px-4 py-2 mt-2"
              onClick={() => setOpen(false)}
            >
              Add to Discord
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-card/20 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/30">
              <img src={mascotImg} alt="Slither Music" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white">SLITHER MUSIC</span>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <p className="font-semibold text-white uppercase tracking-wider text-xs">Bot</p>
              <Link href="/" className="block text-muted-foreground hover:text-white transition-colors">Home</Link>
              <Link href="/features" className="block text-muted-foreground hover:text-white transition-colors">Features</Link>
              <Link href="/status" className="block text-muted-foreground hover:text-white transition-colors">Status</Link>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-white uppercase tracking-wider text-xs">Community</p>
              <Link href="/support" className="block text-muted-foreground hover:text-white transition-colors">Support</Link>
              <Link href="/faq" className="block text-muted-foreground hover:text-white transition-colors">FAQ</Link>
              <a href={INVITE_LINK} target="_blank" rel="noreferrer" className="block text-muted-foreground hover:text-white transition-colors">Invite Bot</a>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-white uppercase tracking-wider text-xs">Legal</p>
              <Link href="/terms" className="block text-muted-foreground hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Slither Music. All rights reserved.</p>
          <p>Not affiliated with Discord, Inc.</p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
