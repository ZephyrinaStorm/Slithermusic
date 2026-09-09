import { motion } from 'framer-motion';
import { MessageCircle, BookOpen, Bug, Lightbulb, Mail } from 'lucide-react';
import { Layout, INVITE_LINK } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const SUPPORT_OPTIONS = [
  {
    icon: <MessageCircle className="w-7 h-7" />,
    title: 'Discord Support Server',
    description:
      'The fastest way to get help. Join our support server and open a ticket — someone from the team will respond as soon as possible.',
    cta: 'Join Server',
    href: 'https://discord.gg/dragonsdenmusicbot',
    primary: true,
  },
  {
    icon: <BookOpen className="w-7 h-7" />,
    title: 'Frequently Asked Questions',
    description:
      'Before reaching out, check the FAQ page — most common questions about setup, permissions, and commands are answered there.',
    cta: 'Read FAQ',
    href: '/faq',
    internal: true,
    primary: false,
  },
  {
    icon: <Bug className="w-7 h-7" />,
    title: 'Report a Bug',
    description:
      'Found something broken? Join the support server and post in the #bug-reports channel with your server ID and steps to reproduce.',
    cta: 'Report Bug',
    href: 'https://discord.gg/dragonsdenmusicbot',
    primary: false,
  },
  {
    icon: <Lightbulb className="w-7 h-7" />,
    title: 'Feature Requests',
    description:
      "Have an idea that would make Slither Music better? Post it in #feature-requests on the support server and the community can upvote it.",
    cta: 'Suggest Feature',
    href: 'https://discord.gg/dragonsdenmusicbot',
    primary: false,
  },
];

function SupportCard({ option, index }: { option: typeof SUPPORT_OPTIONS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`bg-card border rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden group hover:border-primary/30 transition-colors ${
        option.primary ? 'border-primary/40' : 'border-white/5'
      }`}
    >
      {option.primary && (
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
          option.primary
            ? 'bg-primary text-white'
            : 'bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white'
        }`}
      >
        {option.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold text-lg text-white mb-2">{option.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{option.description}</p>
      </div>
      {option.internal ? (
        <Button asChild variant={option.primary ? 'default' : 'outline'} className="w-fit">
          <Link href={option.href}>{option.cta}</Link>
        </Button>
      ) : (
        <Button asChild variant={option.primary ? 'default' : 'outline'} className="w-fit">
          <a href={option.href} target="_blank" rel="noreferrer">{option.cta}</a>
        </Button>
      )}
    </motion.div>
  );
}

export default function SupportPage() {
  return (
    <Layout>
      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Support</h1>
            <p className="text-muted-foreground text-lg">
              We're here to help. Choose the option that fits your situation best.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support options */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {SUPPORT_OPTIONS.map((option, i) => (
              <SupportCard key={option.title} option={option} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Response time notice */}
      <section className="pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card/50 border border-white/5 rounded-2xl p-7 flex flex-col sm:flex-row items-start gap-5"
          >
            <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white mb-2">Response Times</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Support tickets on our Discord server are typically answered within a few hours during active hours.
                For critical issues (bot entirely down, data loss), ping <code className="text-primary bg-primary/10 px-1 rounded">@Support</code> in the server.
                We do not provide support via DMs — please use the server channels so others can benefit from the answer too.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom invite */}
      <section className="py-16 border-t border-white/5 bg-card/20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground mb-4">Not using Slither Music yet?</p>
          <Button asChild size="lg">
            <a href={INVITE_LINK} target="_blank" rel="noreferrer">Add to Discord — it's free</a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
