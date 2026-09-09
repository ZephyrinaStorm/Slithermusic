import { motion } from 'framer-motion';
import {
  Play, ListMusic, Radio, Mic2, Settings2, Info,
  Headphones, Database, Zap, Activity, Music, Globe,
} from 'lucide-react';
import { SiSpotify, SiYoutube, SiSoundcloud, SiApplemusic } from 'react-icons/si';
import { Layout, INVITE_LINK } from '@/components/layout';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: <Play className="w-6 h-6" />,
    title: 'Full Playback Control',
    description:
      'Everything you need to control your music session: play, pause, skip, seek, volume, loop modes, shuffle, and instant replay. Plus 247 mode to keep music going all night.',
    tags: ['/play', '/pause', '/skip', '/seek', '/volume', '/loop', '/shuffle', '/247'],
  },
  {
    icon: <Radio className="w-6 h-6" />,
    title: '22 Audio Filters',
    description:
      'Transform your audio in real time. Bassboost, nightcore, vaporwave, 8D spatial audio, karaoke, tremolo, vibrato, and more. Stack multiple filters for unique soundscapes.',
    tags: ['/bassboost', '/nightcore', '/vaporwave', '/8d', '/karaoke', '/speed', '/pitch'],
  },
  {
    icon: <ListMusic className="w-6 h-6" />,
    title: 'Advanced Queue Management',
    description:
      'Full queue control with 17+ commands. Skip to any position, move tracks, remove ranges, reverse the queue, deduplicate, or grab a track to your DMs.',
    tags: ['/skipto', '/jump', '/removerange', '/reverse', '/unique', '/grab'],
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Personal Playlists',
    description:
      'Save your favorite queues as named playlists. Up to 10 playlists with 100 songs each. Create, edit, share, shuffle, and load them instantly with one command.',
    tags: ['/playlist create', '/playlist add', '/playlist play', '/playlist save'],
  },
  {
    icon: <Mic2 className="w-6 h-6" />,
    title: 'Live Lyrics',
    description:
      'Pull synced and static lyrics from lrclib.net for any track. Follow along in real time with /synclyrics, or get the full song text instantly with /lyrics.',
    tags: ['/lyrics', '/synclyrics'],
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Multi-Platform Sources',
    description:
      'Search eight audio platforms, including YouTube, Spotify, SoundCloud, Apple Music, Deezer, Amazon Music, Gaana, and Tidal, plus compatible direct links and HTTP streams.',
    tags: ['/youtube', '/spotify', '/platform', '/play'],
  },
  {
    icon: <Settings2 className="w-6 h-6" />,
    title: 'Server Settings',
    description:
      'Lock music controls to a DJ role, restrict the bot to a specific channel, toggle now-playing announcements, and configure per-server preferences.',
    tags: ['/dj', '/channellock', '/announce', '/color'],
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'Live Node Telemetry',
    description:
      'Monitor the audio infrastructure in real time. Check Lavalink node health, connection latency, and version directly from Discord or the status page.',
    tags: ['/nodeinfo', '/ping', '/botinfo', '/stats'],
  },
  {
    icon: <Music className="w-6 h-6" />,
    title: 'Vote Skip & Autoplay',
    description:
      'Fair democratic skip voting so no one person controls the queue. Autoplay keeps the vibe going when the queue runs dry by finding related tracks.',
    tags: ['/voteskip', '/forceskip', '/autoplay'],
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Playback',
    description:
      'Queue jumpers for power users: /playnext puts a track directly after the current one, /playtop pushes it to the very front, /replay restarts the current track.',
    tags: ['/playnext', '/playtop', '/duplicate', '/movetofront', '/replay'],
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: 'Play History',
    description:
      'Never lose a track. Browse everything played this session with /history, jump back to the previous track with /previous, or use /grab to save to DMs.',
    tags: ['/history', '/previous', '/grab'],
  },
  {
    icon: <Info className="w-6 h-6" />,
    title: 'Complete Info Suite',
    description:
      'Get full player details, uptime, latency, and per-server stats at any time. The /help command exposes every command in categorized, interactive menus.',
    tags: ['/help', '/playerinfo', '/uptime', '/effects'],
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.1 }}
      className="bg-card border border-white/5 rounded-2xl p-7 flex flex-col gap-5 hover:border-primary/30 transition-colors group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {feature.icon}
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-white mb-2">{feature.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
      </div>
      <div className="flex flex-wrap gap-2 mt-auto">
        {feature.tags.map((tag) => (
          <span key={tag} className="text-xs font-mono bg-white/5 text-primary/80 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function FeaturesPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>99 Slash Commands</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Everything You Need.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-300 to-cyan-400">Nothing You Don't.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Slither Music packs 99 carefully crafted commands into 12 feature areas. Powerful enough for power users, simple enough for anyone.
            </p>
            <Button asChild size="lg">
              <a href={INVITE_LINK} target="_blank" rel="noreferrer">Add to Discord</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-card/30 py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '99', label: 'Slash Commands' },
              { value: '22', label: 'Audio Filters' },
              { value: '12', label: 'Command Categories' },
              { value: '8+', label: 'Music Sources' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Ready to enter the den?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Free to use. No premium tiers. Every one of these features, available to every server.
          </p>
          <Button asChild size="lg" className="px-10">
            <a href={INVITE_LINK} target="_blank" rel="noreferrer">Invite Slither Music</a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
