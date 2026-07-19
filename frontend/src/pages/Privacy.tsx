import { Shield, Clock, Calendar } from 'lucide-react';
import { getPolicyDates } from '../lib/dates';
import { PolicyLayout } from '../components/PolicyLayout';
import { Section, SubSection, P, Ul, Li, Callout, Grid, Card } from '../components/PolicyHelpers';

export default function Privacy() {
  const { updated, effective } = getPolicyDates();

  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="Your privacy and data protection rights under RA 10173"
      icon={Shield}
      headerGradient="from-blue-600 to-indigo-600"
      subtitleColor="text-blue-100"
      dateBarBg="bg-blue-50 dark:bg-blue-900/20"
      dateBarBorder="border-b border-blue-200 dark:border-blue-800"
      dateText="text-blue-800 dark:text-blue-200"
      updated={updated}
      effective={effective}
    >
      <Section title="1. Introduction and Legal Framework">
        <P>
          Phalanx Cyber Academy ("we," "our," or "us") is committed to protecting your privacy and personal data in accordance with Republic Act No. 10173, also known as the "Data Privacy Act of 2012" of the Philippines. This Act protects individual personal information in information and communications systems in both government and private sectors, recognizing the fundamental human right of privacy while ensuring the free flow of information to promote innovation and growth.
        </P>
        <Callout color="blue" title="Key Legislative Reference">
          This Privacy Policy is formulated in compliance with Republic Act No. 10173 (Data Privacy Act of 2012), its Implementing Rules and Regulations, and other applicable data protection laws of the Philippines.
        </Callout>
      </Section>

      <Section title="2. Data Controller Information">
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-6">
          <P className="mb-2"><strong>Personal Information Controller:</strong> Phalanx Cyber Academy</P>
          <P className="mb-2"><strong>Address:</strong> [Your Company Address]</P>
          <P className="mb-2"><strong>Email:</strong> privacy@example.com</P>
          <P className="mb-2"><strong>Data Protection Officer:</strong> [DPO Name and Contact]</P>
          <P><strong>National Privacy Commission Registration:</strong> [Registration Number if applicable]</P>
        </div>
      </Section>

      <Section title="3. Definitions (Per RA 10173)">
        <div className="space-y-4 mb-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Any information, whether recorded in material form or not, from which your identity is apparent or can be reasonably and directly ascertained, or when put together with other information would directly and certainly identify you as an individual.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sensitive Personal Information</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Personal information about your race, ethnic origin, marital status, age, color, religious, philosophical or political affiliations, health, education, genetic or sexual life, or information about criminal proceedings.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Processing</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Any operation performed upon personal information including collection, recording, organization, storage, updating, retrieval, consultation, use, consolidation, blocking, erasure or destruction of data.
            </p>
          </div>
        </div>
      </Section>

      <Section title="4. Personal Information We Collect">
        <SubSection title="4.1 Information You Provide Directly">
          <Ul className="mb-4">
            <Li><strong>Account Information:</strong> Username, email address (we use passwordless authentication)</Li>
            <Li><strong>Contact Information:</strong> Name, email address, subject, and message content when using our contact form</Li>
            <Li><strong>Profile Information:</strong> Any additional information you voluntarily provide in your user profile</Li>
          </Ul>
        </SubSection>
        <SubSection title="4.2 Information Collected Automatically">
          <Ul>
            <Li><strong>Technical Information:</strong> IP address, browser type, operating system, device information</Li>
            <Li><strong>Usage Information:</strong> Pages visited, time spent on site, click patterns, session data</Li>
            <Li><strong>Security Information:</strong> Login attempt logs, session tokens, authentication data</Li>
            <Li><strong>Timezone Information:</strong> Your device's timezone setting is automatically detected during account creation using browser APIs to provide personalized time-based features and content. This information is used solely to enhance your user experience by displaying times in your local timezone and is stored securely with your account preferences.</Li>
          </Ul>
        </SubSection>
        <SubSection title="4.3 Automatic Timezone Detection">
          <Callout color="blue" title="How We Detect Your Timezone" icon={<Clock className="h-5 w-5" />}>
            <P className="mb-4 text-sm">
              During account creation, our system automatically detects your timezone using your browser's built-in timezone API (Intl.DateTimeFormat). This is a standard web technology that provides your device's timezone setting without accessing any sensitive location data.
            </P>
            <Ul className="text-sm space-y-1">
              <Li><strong>What we collect:</strong> IANA timezone identifier (e.g., "Asia/Manila", "America/New_York")</Li>
              <Li><strong>How it's collected:</strong> JavaScript browser API during account setup</Li>
              <Li><strong>Purpose:</strong> Display timestamps, deadlines, and schedules in your local time</Li>
              <Li><strong>Storage:</strong> Stored with your account preferences, can be updated anytime</Li>
              <Li><strong>User control:</strong> You can modify your timezone preference in account settings</Li>
            </Ul>
          </Callout>
        </SubSection>
      </Section>

      <Section title="5. Legal Basis for Processing (Section 12, RA 10173)">
        <P className="mb-4">We process your personal information based on the following lawful grounds under Section 12 of RA 10173:</P>
        <Grid cols={2}>
          <Card color="green" title="Consent (Section 12(a))">
            For account creation, marketing communications, and optional features
          </Card>
          <Card color="blue" title="Contract Performance (Section 12(b))">
            To provide our services and fulfill our obligations to you
          </Card>
          <Card color="purple" title="Legitimate Interest (Section 12(f))">
            For security monitoring, fraud prevention, and service improvement
          </Card>
          <Card color="orange" title="Legal Obligation (Section 12(c))">
            To comply with applicable laws and regulations
          </Card>
        </Grid>
      </Section>

      <Section title="6. Data Privacy Principles (Section 11, RA 10173)">
        <P className="mb-4">In accordance with Section 11 of RA 10173, we ensure that personal information is:</P>
        <Ul>
          <Li><strong>Collected for specific and legitimate purposes</strong> determined before or as soon as practicable after collection</Li>
          <Li><strong>Processed fairly and lawfully</strong> in accordance with the declared purposes</Li>
          <Li><strong>Accurate, relevant and up-to-date</strong> for the purposes for which it is processed</Li>
          <Li><strong>Adequate and not excessive</strong> in relation to the purposes for collection and processing</Li>
          <Li><strong>Retained only as long as necessary</strong> for the fulfillment of the stated purposes</Li>
          <Li><strong>Kept in a form permitting identification</strong> for no longer than necessary for the stated purposes</Li>
        </Ul>
      </Section>

      <Section title="7. Your Rights as a Data Subject (Section 16, RA 10173)">
        <P className="mb-4">Under Section 16 of RA 10173, you have the following rights:</P>
        <Grid cols={2}>
          <Card color="blue" title="Right to be Informed">
            Be informed whether personal information pertaining to you is being processed
            <Ul className="mt-3 text-xs space-y-1">
              <Li>Description of personal information being processed</Li>
              <Li>Purposes for which they are being processed</Li>
              <Li>Recipients or classes of recipients</Li>
              <Li>Period for which information will be stored</Li>
            </Ul>
          </Card>
          <Card color="green" title="Right of Access">
            Reasonable access to your personal information that we process
            <Ul className="mt-3 text-xs space-y-1">
              <Li>Contents of your personal information</Li>
              <Li>Sources from which information was obtained</Li>
              <Li>Names and addresses of recipients</Li>
              <Li>Manner by which data was processed</Li>
            </Ul>
          </Card>
          <Card color="orange" title="Right to Rectification">
            Dispute inaccuracy and have us correct information immediately
            <Ul className="mt-3 text-xs space-y-1">
              <Li>Correct inaccurate or incomplete data</Li>
              <Li>Update outdated information</Li>
              <Li>Modify timezone preferences through account settings</Li>
              <Li>Notify third parties of corrections</Li>
            </Ul>
          </Card>
          <Card color="red" title="Right to Erasure/Blocking">
            Suspend, withdraw or order blocking/removal/destruction of your data
            <Ul className="mt-3 text-xs space-y-1">
              <Li>When data is incomplete or outdated</Li>
              <Li>When data was unlawfully obtained</Li>
              <Li>When data is used for unauthorized purposes</Li>
              <Li>When data is no longer necessary</Li>
            </Ul>
          </Card>
          <Card color="purple" title="Right to Data Portability (Section 18)">
            Obtain a copy of your data in electronic or structured format for transfer to another controller
          </Card>
          <Card color="gray" title="Right to Indemnification">
            Be indemnified for damages due to inaccurate, incomplete, or unauthorized use of personal information
          </Card>
        </Grid>
      </Section>

      <Section title="8. Security of Personal Information (Section 20, RA 10173)">
        <P className="mb-4">In compliance with Section 20 of RA 10173, we implement reasonable and appropriate organizational, physical and technical measures:</P>
        <Grid cols={2}>
          <Card color="blue" title="Technical Measures">
            <Ul className="text-sm space-y-1">
              <Li>Passwordless authentication with email verification codes</Li>
              <Li>HTTPS encryption for data transmission</Li>
              <Li>Secure session management</Li>
              <Li>Network security safeguards</Li>
              <Li>Timezone data validation against IANA database</Li>
            </Ul>
          </Card>
          <Card color="green" title="Organizational Measures">
            <Ul className="text-sm space-y-1">
              <Li>Data protection policies and procedures</Li>
              <Li>Employee confidentiality obligations</Li>
              <Li>Access controls and authorization</Li>
              <Li>Regular security monitoring</Li>
              <Li>User control over timezone preferences</Li>
            </Ul>
          </Card>
        </Grid>
      </Section>

      <Section title="9. Data Breach Notification (Section 20(f), RA 10173)">
        <P>
          In compliance with Section 20(f) of RA 10173, we will promptly notify the National Privacy Commission and affected data subjects when sensitive personal information is reasonably believed to have been acquired by an unauthorized person, and such acquisition is likely to give rise to a real risk of serious harm to affected data subjects.
        </P>
      </Section>

      <Section title="10. Cross-Border Data Transfer">
        <P>
          Any transfer of personal information outside the Philippines will be conducted in accordance with RA 10173 and its implementing regulations, ensuring adequate protection through appropriate safeguards such as standard contractual clauses or adequacy decisions by the National Privacy Commission.
        </P>
      </Section>

      <Section title="11. Data Retention">
        <P className="mb-4">
          In accordance with Section 11(e) of RA 10173, we retain personal information only for as long as necessary for the fulfillment of the purposes for which the data was obtained, for the establishment, exercise or defense of legal claims, or for legitimate business purposes.
        </P>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Retention Periods by Data Type</h4>
          <Ul className="text-sm mb-0">
            <Li><strong>Account data:</strong> Retained until you request deletion</Li>
            <Li><strong>Security logs:</strong> Automatically deleted after 30 days</Li>
            <Li><strong>Session data:</strong> Deleted upon logout or session expiry</Li>
            <Li><strong>Contact form submissions:</strong> Retained for 1 year for support purposes</Li>
          </Ul>
        </div>
      </Section>

      <Section title="12. National Privacy Commission">
        <Callout color="blue" title="Filing Complaints">
          <P className="text-sm mb-3">
            You have the right to file a complaint with the National Privacy Commission if you believe your data privacy rights have been violated.
          </P>
          <div className="text-sm space-y-1">
            <p><strong>National Privacy Commission</strong></p>
            <p>5th Floor, Philippine International Convention Center</p>
            <p>Vicente Sotto St., Pasay City</p>
            <p>Email: info@privacy.gov.ph</p>
            <p>Website: https://www.privacy.gov.ph</p>
          </div>
        </Callout>
      </Section>

      <Section title="13. Changes to Privacy Policy">
        <P className="mb-4">
          We may update this Privacy Policy to reflect changes in our practices, applicable laws, or National Privacy Commission guidelines. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date.
        </P>
        <Callout color="yellow" title="Policy Change Notice Period" icon={<Calendar className="h-5 w-5" />}>
          <strong>Important:</strong> Any changes to this Privacy Policy will take effect 14 days after the updated policy is posted on this page. This 14-day notice period allows you time to review the changes and decide whether to continue using our services. Your continued use of our services after the 14-day period constitutes acceptance of the updated policy.
        </Callout>
      </Section>

      <Section title="14. Contact Us">
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-6">
          <P className="mb-4">
            If you have any questions about this Privacy Policy or wish to exercise your rights under RA 10173, please contact us:
          </P>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Data Protection Officer:</strong> [DPO Name]</p>
            <p><strong>Email:</strong> privacy@example.com</p>
            <p><strong>Address:</strong> [Your Company Address]</p>
            <p><strong>Phone:</strong> [Your Contact Number]</p>
          </div>
          <P className="mt-4 text-sm">
            <strong>Response Time:</strong> We will respond to your inquiries within fifteen (15) days as required by the Data Privacy Act of 2012.
          </P>
        </div>
        <Callout color="blue">
          <strong>Legal Compliance:</strong> This privacy policy is compliant with Republic Act No. 10173 (Data Privacy Act of 2012) and its Implementing Rules and Regulations. Last updated: {updated}
        </Callout>
      </Section>
    </PolicyLayout>
  );
}
