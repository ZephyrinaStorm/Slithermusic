import { useGetBotStatus } from '@workspace/api-client-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Activity, ShieldCheck, Database, Zap, Server, Radio } from 'lucide-react';
import { SiSpotify, SiYoutube, SiSoundcloud, SiApplemusic } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Layout, INVITE_LINK } from '@/components/layout';
import { Link } from 'wouter';
import mascotImg from '@assets/IMG_1398_1784529128566.jpeg';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden">
      {/* Ambient cyan orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      {/* Subtle serpentine streak at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <motion.div
        style={{ y, opacity }}
        className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12"
      >
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>99 Slash Commands. Zero Compromise.</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display leading-[1.05] tracking-tight mb-6">
              FEEL THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-300 to-cyan-500 text-glow">
                RHYTHM.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              The ultimate auditory experience for your Discord server. Crystal-clear audio, serpentine precision, and music that slithers through every channel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto shadow-[0_0_24px_rgba(34,183,255,0.35)]">
                <a href={INVITE_LINK} target="_blank" rel="noreferrer">Add to Discord</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/features">View Features</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex-1 relative max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_80px_rgba(34,183,255,0.22)]">
            <img src={mascotImg} alt="Slither Music Mascot" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          {/* Floating cyan ring behind image */}
          <div className="absolute -inset-4 rounded-3xl border border-primary/10 pointer-events-none" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Status teaser ───────────────────────────────────────────────────────────
function StatusSection() {
  const { data: status, isLoading } = useGetBotStatus();

  return (
    <section id="status" className="py-20 relative border-y border-white/5 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Node Telemetry</h2>
            <p className="text-muted-foreground max-w-lg">
              Live audio infrastructure status. Our Lavalink nodes deliver crystal-clear sound with near-zero latency.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/status">Full status page →</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl" />)}
          </div>
        ) : status?.nodes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {status.nodes.map((node) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-primary/40 transition-colors serpentine-line"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <span className="font-display font-semibold tracking-wide capitalize">{node.id}</span>
                  </div>
                  <div className={cn(
                    'flex items-center gap-2 text-sm font-medium px-2 py-1 rounded-md',
                    node.online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive',
                  )}>
                    <div className={cn('w-2 h-2 rounded-full', node.online ? 'bg-emerald-400 animate-pulse' : 'bg-destructive')} />
                    {node.online ? 'ONLINE' : 'OFFLINE'}
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Host</span>
                    <span className="font-mono text-xs">{node.host}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="font-mono text-primary">{node.latencyMs !== null ? `${node.latencyMs}ms` : '—'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">Telemetry temporarily unavailable.</div>
        )}
      </div>
    </section>
  );
}

// ─── Value props ──────────────────────────────────────────────────────────────
function ValuePropSection() {
  const props = [
    { icon: <Activity className="w-6 h-6" />, title: 'Crystal-Clear Audio', desc: 'Built on optimized Lavalink nodes. Zero stutter, zero dropouts. Music that flows like water through your server.' },
    { icon: <ShieldCheck className="w-6 h-6" />, title: 'Serpentine Precision', desc: '99 commands that never overwhelm. An intuitive interface that wraps around your workflow and puts full control in your hands.' },
    { icon: <Database className="w-6 h-6" />, title: 'Persistent Memory', desc: 'Save your favorite queues, sync lyrics in real-time, and maintain playlists across every session.' },
  ];

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {props.map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-background group-hover:shadow-[0_0_24px_rgba(34,183,255,0.4)] transition-all duration-300">
                {prop.icon}
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{prop.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Filters ─────────────────────────────────────────────────────────────────
function FiltersSection() {
  const filters = ['bassboost', 'nightcore', 'vaporwave', '8d', 'karaoke', 'tremolo', 'vibrato', 'speed', 'pitch', 'clearfilters'];

  return (
    <section id="filters" className="py-28 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary mb-2">
              <Radio className="w-4 h-4" />
              <span className="text-sm font-medium">22 Audio Filters</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Shape the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-300 to-cyan-400">Sound.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg">
              Apply studio-grade effects in real-time without dropping a single note. From bass-heavy drops to silky smooth nightcore — the music bends to you.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {filters.map((filter, i) => (
                <motion.div
                  key={filter}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="px-4 py-2 rounded-lg bg-card border border-white/5 font-mono text-sm hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_rgba(34,183,255,0.15)] transition-all cursor-default"
                >
                  /{filter}
                </motion.div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/features">See all 22 filters →</Link>
            </Button>
          </div>

          {/* Animated equalizer — cyan bars */}
          <div className="flex-1 w-full max-w-lg">
            <div className="aspect-square bg-card/50 border border-white/8 rounded-2xl p-8 relative flex items-end justify-center gap-2 overflow-hidden shadow-[0_0_60px_rgba(34,183,255,0.12)]">
              {/* Subtle grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,183,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,183,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-full rounded-t-sm relative z-10"
                  style={{
                    background: `linear-gradient(to top, hsl(199,90%,45%), hsl(199,90%,70%))`,
                    boxShadow: '0 0 8px rgba(34,183,255,0.4)',
                  }}
                  animate={{ height: ['20%', '80%', '40%', '90%', '30%'] }}
                  transition={{ duration: 2 + i * 0.15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sources ──────────────────────────────────────────────────────────────────
function SourcesSection() {
  const sources = [
    { name: 'Spotify', type: 'Search', icon: <SiSpotify className="w-7 h-7" /> },
    { name: 'YouTube', type: 'Search', icon: <SiYoutube className="w-7 h-7" /> },
    { name: 'SoundCloud', type: 'Search', icon: <SiSoundcloud className="w-7 h-7" /> },
    { name: 'Apple Music', type: 'Search', icon: <SiApplemusic className="w-7 h-7" /> },
    { name: 'Deezer', type: 'Search', icon: <Radio className="w-7 h-7" /> },
    { name: 'Amazon Music', type: 'Search', icon: <Radio className="w-7 h-7" /> },
    { name: 'Gaana', type: 'Search', icon: <Radio className="w-7 h-7" /> },
    { name: 'Tidal', type: 'Search', icon: <Radio className="w-7 h-7" /> },
    { name: 'Bandcamp', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
    { name: 'Vimeo', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
    { name: 'Niconico', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
    { name: 'Pandora', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
    { name: 'Shazam', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
    { name: 'Bilibili', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
    { name: 'Yandex Music', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
    { name: 'HTTP streams', type: 'Direct link', icon: <Radio className="w-7 h-7" /> },
  ];

  return (
    <section className="py-20 bg-card/30 border-y border-white/5">
      <div className="container mx-auto px-6 text-center">
        <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-4">Supported Platforms</p>
        <h2 className="text-3xl font-display font-bold mb-4">Any Source. Any Time.</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Search eight platforms by name, or drop a compatible link into <span className="text-primary font-medium">/play</span>.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 max-w-6xl mx-auto">
          {sources.map((src, i) => (
            <motion.div
              key={src.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-background/30 px-3 py-4 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all"
            >
              <span className="grayscale group-hover:grayscale-0">{src.icon}</span>
              <span className="font-display font-medium text-sm">{src.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{src.type}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/3" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/12 rounded-full blur-[160px] pointer-events-none" />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_50px_rgba(34,183,255,0.35)] mb-8">
          <img src={mascotImg} alt="Slither Music Logo" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-5xl md:text-7xl font-display font-bold mb-4 text-glow">LET IT SLITHER.</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Join thousands of servers already experiencing the highest tier of Discord audio. Free, forever.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="px-12 shadow-[0_0_28px_rgba(34,183,255,0.4)]">
            <a href={INVITE_LINK} target="_blank" rel="noreferrer">Invite to Discord</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/features">Explore Features</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <StatusSection />
      <ValuePropSection />
      <FiltersSection />
      <SourcesSection />
      <CTASection />
    </Layout>
  );
}
