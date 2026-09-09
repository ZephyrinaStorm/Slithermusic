import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { Link } from 'wouter';

const LAST_UPDATED = 'July 20, 2026';

export default function PrivacyPage() {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="prose prose-invert prose-purple max-w-none space-y-8 text-muted-foreground leading-relaxed"
          >
            <Section title="1. Introduction">
              <p>
                Slither Music ("we", "our", "the Bot") is committed to protecting your privacy. This Privacy Policy
                explains what data we collect, how we use it, and how we protect it. By using the Bot you consent to
                the practices described here.
              </p>
            </Section>

            <Section title="2. Data We Collect">
              <p>Slither Music is designed to be privacy-minimal. Here is exactly what is stored:</p>
              <ul>
                <li>
                  <strong className="text-white">Guild (server) IDs</strong> — stored in memory to maintain
                  per-server settings such as DJ role ID, channel lock, volume preference, 24/7 mode, and
                  announcement toggle. These settings are lost when the Bot restarts.
                </li>
                <li>
                  <strong className="text-white">User IDs (playlists only)</strong> — if you create a personal
                  playlist using <code className="text-primary bg-primary/10 px-1 rounded">/playlist create</code>,
                  your Discord user ID is associated with your playlist data in memory for the duration of the Bot's
                  current session. This data is not persisted to any database.
                </li>
                <li>
                  <strong className="text-white">Play history (in-memory, per session)</strong> — the titles and
                  URLs of tracks played in a session are held in memory to power <code className="text-primary bg-primary/10 px-1 rounded">/history</code> and
                  {' '}<code className="text-primary bg-primary/10 px-1 rounded">/previous</code>. This is never
                  written to disk.
                </li>
              </ul>
              <p>
                <strong className="text-white">We do not collect:</strong> message content, voice audio, usernames,
                email addresses, payment information, or any personally identifiable information beyond Discord user IDs
                where required for playlist functionality.
              </p>
            </Section>

            <Section title="3. How We Use Data">
              <p>All data collected is used solely to provide and improve the Bot's functionality:</p>
              <ul>
                <li>Guild IDs and settings are used to apply your server's preferences to Bot behaviour.</li>
                <li>User IDs are used to associate playlists with the correct Discord account.</li>
                <li>Play history is used to power session-based commands like /history.</li>
              </ul>
              <p>We do not sell, rent, share, or monetise any collected data. We do not use data for advertising.</p>
            </Section>

            <Section title="4. Data Retention">
              <p>
                Because all data is held in memory (not a persistent database), all guild settings, playlists, and
                history are automatically erased whenever the Bot process restarts. We do not retain any user data
                beyond the current running session.
              </p>
            </Section>

            <Section title="5. Third-Party Services">
              <p>Slither Music interacts with the following third-party services to provide its core features:</p>
              <ul>
                <li>
                  <strong className="text-white">Lavalink audio nodes</strong> — used to stream audio. Your search
                  queries are forwarded to these nodes. Node operators may have their own privacy policies.
                </li>
                <li>
                  <strong className="text-white">lrclib.net</strong> — queried when you use /lyrics or /synclyrics.
                  Your track title and artist are sent to this API to retrieve lyrics.
                </li>
                <li>
                  <strong className="text-white">Supported audio and music platforms</strong> —
                  search queries are forwarded to these platforms via Lavalink. Their respective privacy policies apply.
                </li>
              </ul>
            </Section>

            <Section title="6. Security">
              <p>
                We take reasonable technical and organisational measures to protect the data we hold. However, because
                the Bot operates in memory with no persistent database, the attack surface for data breaches is minimal.
                No system is completely secure, and we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="7. Children's Privacy">
              <p>
                The Bot is not directed at children under the age of 13. We do not knowingly collect data from children
                under 13. If you believe a child under 13 has used the Bot, please contact us and we will take
                appropriate steps.
              </p>
            </Section>

            <Section title="8. Your Rights">
              <p>
                Because we store only server-level and in-memory data with no persistent user records, there is
                typically no personally identifiable data to access, correct, or delete. If you have a specific concern
                about data related to you, contact us via the{' '}
                <Link href="/support" className="text-primary hover:underline">support server</Link> and we will
                respond promptly.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. The "Last updated" date at the top of the page
                will always reflect the current version. Continued use of the Bot after changes are posted constitutes
                acceptance of the revised policy.
              </p>
            </Section>

            <Section title="10. Contact">
              <p>
                Questions about this Privacy Policy? Reach out via our{' '}
                <Link href="/support" className="text-primary hover:underline">Support page</Link>.
              </p>
            </Section>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/5 pt-8">
      <h2 className="text-xl font-display font-bold text-white mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
