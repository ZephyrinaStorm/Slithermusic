import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Layout, INVITE_LINK } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const FAQS = [
  {
    question: 'How do I add Dragon\'s Den to my server?',
    answer:
      'Click the "Add to Discord" button in the navigation or use /invite inside any server where the bot is present. You need the "Manage Server" permission to add bots.',
  },
  {
    question: 'Is Dragon\'s Den free to use?',
    answer:
      'Yes — completely free. All 99 commands are available to every server without any premium tiers, subscriptions, or paywalls.',
  },
  {
    question: 'Why isn\'t the bot playing music?',
    answer:
      'Make sure you are in a voice channel before running /play. The bot also needs the "Connect" and "Speak" permissions in that voice channel. If it still doesn\'t work, check /nodeinfo to see if the audio nodes are connected.',
  },
  {
    question: 'Can I restrict music commands to specific roles?',
    answer:
      'Yes. Use /dj set @role to restrict all music controls to users who have that role. Run /dj clear to remove the restriction. Use /dj info to see the current setting.',
  },
  {
    question: 'What music sources are supported?',
    answer:
      'Slither Music can search YouTube, SoundCloud, Spotify, Apple Music, Deezer, Amazon Music, Gaana, and Tidal. Use /platform for the additional search services. /play also accepts compatible direct links and HTTP audio streams from the Lavalink node.',
  },
  {
    question: 'Does the bot support Spotify links?',
    answer:
      'Yes. Paste a Spotify track, album, or playlist URL into /play and the bot will resolve and stream it. Note: the bot streams from an audio source — it is not using the Spotify API for playback directly.',
  },
  {
    question: 'How do I use playlists?',
    answer:
      'Create a playlist with /playlist create <name>, add the current queue with /playlist save <name> or individual tracks with /playlist add <name> <url>. Load it any time with /playlist play <name>. Each user can have up to 10 playlists.',
  },
  {
    question: 'What are audio filters?',
    answer:
      'Filters process the audio stream in real time to change how it sounds. Try /bassboost for heavier bass, /nightcore to speed things up and raise the pitch, or /8d for a spatial headphone effect. Use /clearfilters to reset everything.',
  },
  {
    question: 'How do synced lyrics work?',
    answer:
      '/synclyrics fetches timed lyrics from lrclib.net and posts each line to the chat as the track plays. /lyrics fetches the full lyrics text in one message. Both work best with well-known tracks that have indexed lyrics.',
  },
  {
    question: 'The bot left my voice channel — why?',
    answer:
      'By default, Dragon\'s Den auto-disconnects after 30 seconds if it is alone in the voice channel. Enable /247 mode to keep it connected permanently (until the queue ends or /disconnect is used).',
  },
  {
    question: 'Can I export my queue?',
    answer:
      'Yes. /queueexport generates a text file containing all track URLs in your current queue, which you can import later.',
  },
  {
    question: 'How do I report a bug or request a feature?',
    answer:
      'Head to the Support page and join the Dragon\'s Den support server. You can open a ticket there or describe the issue in the bugs channel.',
  },
];

function FAQItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.06 }}
      className="border border-white/5 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-card hover:bg-card/80 transition-colors gap-4"
      >
        <span className="font-semibold text-white">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-6 py-5 text-muted-foreground leading-relaxed border-t border-white/5 bg-card/50">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  return (
    <Layout>
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">
              Quick answers to the most common questions about Slither Music.
              Can't find what you need?{' '}
              <Link href="/support" className="text-primary hover:underline">Visit the support page.</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ list */}
      <section className="pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>

          {/* Still stuck */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-card border border-white/5 rounded-2xl p-8 text-center"
          >
            <h2 className="text-2xl font-display font-bold mb-3">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Our support server is the fastest way to get a real answer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/support">Go to Support</Link>
              </Button>
              <Button asChild>
                <a href={INVITE_LINK} target="_blank" rel="noreferrer">Add to Discord</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
