import { Cookie, ShieldCheck, Settings, BarChart3, Lock, Info, AlertTriangle, Calendar } from 'lucide-react';
import { getPolicyDates } from '../lib/dates';
import { PolicyLayout } from '../components/PolicyLayout';
import { Section, SubSection, P, Ul, Li, Callout, Grid, Card, Table, Badge } from '../components/PolicyHelpers';

export default function Cookies() {
  const { updated, effective } = getPolicyDates();

  return (
    <PolicyLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies"
      icon={Cookie}
      headerGradient="from-orange-600 to-amber-600"
      subtitleColor="text-orange-100"
      dateBarBg="bg-orange-50 dark:bg-orange-900/20"
      dateBarBorder="border-b border-orange-200 dark:border-orange-800"
      dateText="text-orange-800 dark:text-orange-200"
      updated={updated}
      effective={effective}
    >
      <Section title="1. What Are Cookies?">
        <P>
          Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
        </P>
      </Section>

      <Section title="2. How We Use Cookies">
        <P>
          We use cookies to enhance your browsing experience, analyze site traffic, personalize content, and provide essential website functionality. Our use of cookies is designed to be transparent and respectful of your privacy choices.
        </P>
      </Section>

      <Section title="3. Types of Cookies We Use">
        <Grid cols={2}>
          <Card color="green" title="Essential Cookies" icon={<ShieldCheck className="h-5 w-5" />}>
            <P className="text-sm mb-3">Required for basic website functionality</P>
            <Ul className="text-sm space-y-1">
              <Li>User authentication and session management</Li>
              <Li>Security and fraud prevention</Li>
              <Li>Theme preferences (light/dark mode)</Li>
              <Li>Language preferences</Li>
            </Ul>
            <P className="mt-4 text-xs"><strong>Cannot be disabled</strong></P>
          </Card>
          <Card color="blue" title="Functional Cookies" icon={<Settings className="h-5 w-5" />}>
            <P className="text-sm mb-3">Enable enhanced features and personalization</P>
            <Ul className="text-sm space-y-1">
              <Li>Remember login status</Li>
              <Li>Save form data temporarily</Li>
              <Li>Remember user preferences</Li>
              <Li>Provide personalized content</Li>
            </Ul>
            <P className="mt-4 text-xs"><strong>Can be controlled via browser settings</strong></P>
          </Card>
          <Card color="purple" title="Analytics Cookies" icon={<BarChart3 className="h-5 w-5" />}>
            <P className="text-sm mb-3">Help us understand how visitors use our site</P>
            <Ul className="text-sm space-y-1">
              <Li>Track page views and user behavior</Li>
              <Li>Measure site performance</Li>
              <Li>Understand popular content</Li>
              <Li>Improve user experience</Li>
            </Ul>
            <P className="mt-4 text-xs"><strong>Currently not implemented</strong></P>
          </Card>
          <Card color="red" title="Security Cookies" icon={<Lock className="h-5 w-5" />}>
            <P className="text-sm mb-3">Protect against security threats and fraud</P>
            <Ul className="text-sm space-y-1">
              <Li>Monitor for suspicious activity</Li>
              <Li>Prevent brute force attacks</Li>
              <Li>Track login attempts</Li>
              <Li>Implement rate limiting</Li>
            </Ul>
            <P className="mt-4 text-xs"><strong>Required for security</strong></P>
          </Card>
        </Grid>
      </Section>

      <Section title="4. Specific Cookies We Use">
        <Table
          headers={['Cookie Name', 'Purpose', 'Type', 'Expiry']}
          rows={[
            ['session', 'User authentication and session management (auto-extends with activity)', <Badge key="es" type="essential">Essential</Badge>, '30 days*'],
            ['theme', "Store user's preferred theme (light/dark/system)", <Badge key="fn" type="functional">Functional</Badge>, '1 year'],
            ['csrf_token', 'Cross-site request forgery protection', <Badge key="sc" type="security">Security</Badge>, '1 hour'],
          ]}
        />
        <Callout color="blue" title="Session Auto-Extension" icon={<Info className="h-5 w-5" />}>
          <P className="text-sm mb-2">
            <strong>*</strong> Your session cookie automatically extends its lifetime each time you interact with our website. This means:
          </P>
          <Ul className="text-sm space-y-1">
            <Li>If you remain active on the site, you'll stay logged in</Li>
            <Li>The 30-day countdown resets with each page visit or action</Li>
            <Li>You'll only be logged out after 30 days of complete inactivity</Li>
            <Li>On serverless deployments (Vercel), the duration is 7 days for performance optimization</Li>
          </Ul>
        </Callout>
      </Section>

      <Section title="5. Third-Party Cookies">
        <P>We may use third-party services that set cookies on our behalf:</P>
      </Section>

      <Section title="6. Managing Cookies">
        <SubSection title="6.1 Browser Settings">
          <P className="mb-4">
            Most web browsers allow you to control cookies through their settings. You can usually find these controls in the "Privacy" or "Security" section of your browser's settings.
          </P>
        </SubSection>
        <Grid cols={2}>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Chrome</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">Settings → Privacy and Security → Cookies</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Firefox</h4>
            <p className="text-orange-800 dark:text-orange-200 text-sm">Options → Privacy &amp; Security → Cookies</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Safari</h4>
            <p className="text-gray-800 dark:text-gray-200 text-sm">Preferences → Privacy → Cookies</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Edge</h4>
            <p className="text-purple-800 dark:text-purple-200 text-sm">Settings → Cookies and Site Permissions</p>
          </div>
        </Grid>
        <Callout color="yellow" title="Important Note" icon={<AlertTriangle className="h-5 w-5" />}>
          Disabling essential cookies may affect the functionality of our website. You may not be able to log in, maintain sessions, or use certain features properly.
        </Callout>
      </Section>

      <Section title="7. Data Protection and Privacy">
        <P>
          Our use of cookies is covered by our Privacy Policy and complies with the Republic Act No. 10173 (Data Privacy Act of 2012). We are committed to protecting your privacy and ensuring that your personal information is handled securely and responsibly.
        </P>
      </Section>

      <Section title="8. Changes to the Cookie Policy">
        <P className="mb-4">
          We may update this Cookie Policy to reflect changes in our practices, applicable laws, or National Privacy Commission guidelines. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date.
        </P>
        <Callout color="yellow" title="Cookie Policy Change Notice Period" icon={<Calendar className="h-5 w-5" />}>
          <strong>Important:</strong> Any changes to this Cookie Policy will take effect 14 days after the updated policy is posted on this page. This 14-day notice period allows you time to review the changes and adjust your browser settings if needed. Your continued use of our website after the 14-day period constitutes acceptance of the updated cookie policy.
        </Callout>
      </Section>

      <Section title="9. Contact Us">
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-6">
          <P className="mb-4">
            If you have any questions about our use of cookies, please contact us:
          </P>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> privacy@example.com</p>
            <p><strong>Address:</strong> [Your Company Address]</p>
            <p><strong>Phone:</strong> [Your Contact Number]</p>
          </div>
        </div>
        <Callout color="orange">
          <strong>Last Updated:</strong> {updated} • This policy complies with applicable privacy laws and regulations.
        </Callout>
      </Section>
    </PolicyLayout>
  );
}
