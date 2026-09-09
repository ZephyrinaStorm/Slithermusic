import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { Link } from 'wouter';

const LAST_UPDATED = 'July 20, 2026';

export default function TermsPage() {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Terms of Service</h1>
            <p className="text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="prose prose-invert prose-purple max-w-none space-y-8 text-muted-foreground leading-relaxed"
          >
            <Section title="1. Acceptance of Terms">
              <p>
                By inviting Slither Music ("the Bot") to your Discord server or using any of its commands, you agree to
                be bound by these Terms of Service. If you do not agree, please remove the Bot from your server and stop
                using it immediately.
              </p>
            </Section>

            <Section title="2. Eligibility">
              <p>
                You must be at least 13 years of age to use the Bot, in accordance with Discord's own Terms of Service.
                By using the Bot, you represent and warrant that you meet this age requirement and that you have the
                authority to bind your server community to these terms.
              </p>
            </Section>

            <Section title="3. Permitted Use">
              <p>The Bot is provided for personal, non-commercial entertainment and community use. You may:</p>
              <ul>
                <li>Invite the Bot to any server you own or manage.</li>
                <li>Use all available commands in accordance with these terms.</li>
                <li>Configure server-specific settings such as DJ roles and channel locks.</li>
              </ul>
            </Section>

            <Section title="4. Prohibited Use">
              <p>You may not use the Bot to:</p>
              <ul>
                <li>Stream, reproduce, or distribute copyrighted content in violation of applicable law.</li>
                <li>Harass, threaten, or harm other users.</li>
                <li>Attempt to exploit, reverse-engineer, or otherwise circumvent the Bot's functionality.</li>
                <li>Spam commands in a manner that degrades service for other servers.</li>
                <li>Use the Bot in any way that violates Discord's Terms of Service or Community Guidelines.</li>
              </ul>
            </Section>

            <Section title="5. Copyright and Content">
              <p>
                Slither Music acts as a technical intermediary that locates and streams audio from publicly available
                sources. The Bot does not host, store, or distribute any copyrighted audio content. Users are solely
                responsible for ensuring their use of the Bot complies with all applicable copyright laws and the terms
                of the streaming platforms the Bot accesses.
              </p>
              <p>
                We respect intellectual property rights. If you believe content is being streamed in violation of your
                rights, please contact us via the{' '}
                <Link href="/support" className="text-primary hover:underline">support server</Link>.
              </p>
            </Section>

            <Section title="6. Availability and Uptime">
              <p>
                Slither Music is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted
                availability. The Bot may be taken offline for maintenance, updates, or other reasons at any time and
                without prior notice. We are not liable for any damages resulting from downtime.
              </p>
            </Section>

            <Section title="7. Modifications to the Bot or Terms">
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Bot at any time. We may also
                update these Terms at any time. Continued use of the Bot after changes are posted constitutes
                acceptance of the revised Terms. The "Last updated" date at the top of this page will always reflect
                the most recent version.
              </p>
            </Section>

            <Section title="8. Termination">
              <p>
                We reserve the right to blacklist any user or server from using the Bot at our discretion, particularly
                in cases of abuse, ToS violations, or excessive load on the service.
              </p>
            </Section>

            <Section title="9. Disclaimer of Warranties">
              <p>
                To the maximum extent permitted by law, Slither Music is provided without warranties of any kind,
                whether express or implied. We do not warrant that the Bot will be error-free, that defects will be
                corrected, or that the service is free of harmful components.
              </p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>
                To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising from your use of or inability to use the Bot.
              </p>
            </Section>

            <Section title="11. Contact">
              <p>
                If you have questions about these Terms, please reach out via our{' '}
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
