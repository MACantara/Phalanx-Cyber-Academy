import { FileText, Calendar } from 'lucide-react';
import { getPolicyDates } from '../lib/dates';
import { PolicyLayout } from '../components/PolicyLayout';
import { Section, SubSection, P, Ul, Li, Callout } from '../components/PolicyHelpers';

export default function Terms() {
  const { updated, effective } = getPolicyDates();

  return (
    <PolicyLayout
      title="Terms of Service"
      subtitle="Legal terms and conditions for using our service"
      icon={FileText}
      headerGradient="from-green-600 to-teal-600"
      subtitleColor="text-green-100"
      dateBarBg="bg-green-50 dark:bg-green-900/20"
      dateBarBorder="border-b border-green-200 dark:border-green-800"
      dateText="text-green-800 dark:text-green-200"
      updated={updated}
      effective={effective}
    >
      <Section title="1. Acceptance of Terms">
        <P>
          By accessing and using Phalanx Cyber Academy ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </P>
      </Section>

      <Section title="2. Description of Service">
        <P>
          Phalanx Cyber Academy provides a web application platform that allows users to create accounts, manage profiles, and interact with our services. The Service is provided "as is" and is subject to these Terms of Service.
        </P>
      </Section>

      <Section title="3. User Accounts">
        <SubSection title="3.1 Account Creation">
          <Ul className="mb-4">
            <Li>You must provide accurate and complete information when creating an account</Li>
            <Li>You are responsible for maintaining the confidentiality of your account credentials</Li>
            <Li>You must be at least 13 years old to create an account</Li>
            <Li>One person may not maintain more than one account</Li>
          </Ul>
        </SubSection>
        <SubSection title="3.2 Account Security">
          <Ul>
            <Li>You are responsible for all activities that occur under your account</Li>
            <Li>You must notify us immediately of any unauthorized use of your account</Li>
            <Li>We reserve the right to terminate accounts that violate these terms</Li>
          </Ul>
        </SubSection>
      </Section>

      <Section title="4. Acceptable Use Policy">
        <SubSection title="4.1 Permitted Uses">
          <P className="mb-4">You may use our Service for lawful purposes only. You agree to use the Service in compliance with:</P>
          <Ul className="mb-4">
            <Li>All applicable local, national, and international laws and regulations</Li>
            <Li>These Terms of Service and any additional terms referenced herein</Li>
            <Li>Our Privacy Policy and Cookie Policy</Li>
          </Ul>
        </SubSection>
        <SubSection title="4.2 Prohibited Activities">
          <Callout color="red" title="You agree NOT to use the Service to:">
            <Ul className="text-sm space-y-1">
              <Li>Upload, post, or transmit harmful, threatening, or illegal content</Li>
              <Li>Impersonate any person or entity or misrepresent your affiliation</Li>
              <Li>Attempt to gain unauthorized access to our systems or other users' accounts</Li>
              <Li>Use automated scripts or bots to access the Service</Li>
              <Li>Distribute spam, malware, or viruses</Li>
              <Li>Violate any applicable laws or regulations</Li>
            </Ul>
          </Callout>
        </SubSection>
      </Section>

      <Section title="5. Intellectual Property Rights">
        <SubSection title="5.1 Our Rights">
          <P>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Phalanx Cyber Academy and its licensors. The Service is protected by copyright, trademark, and other laws.
          </P>
        </SubSection>
        <SubSection title="5.2 Your Rights">
          <P>
            You retain rights to any content you submit, post, or display on or through the Service. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and display such content in connection with the Service.
          </P>
        </SubSection>
      </Section>

      <Section title="6. Privacy and Data Protection">
        <P>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information in compliance with RA 10173 (Data Privacy Act of 2012).
        </P>
      </Section>

      <Section title="7. Service Availability">
        <Ul>
          <Li>We strive to maintain high availability but do not guarantee uninterrupted service</Li>
          <Li>We reserve the right to modify, suspend, or discontinue the Service at any time</Li>
          <Li>Scheduled maintenance will be announced in advance when possible</Li>
          <Li>We are not liable for any downtime or service interruptions</Li>
        </Ul>
      </Section>

      <Section title="8. Limitation of Liability">
        <Callout color="yellow">
          <strong>Important:</strong> To the fullest extent permitted by applicable law, Phalanx Cyber Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
        </Callout>
      </Section>

      <Section title="9. Indemnification">
        <P>
          You agree to defend, indemnify, and hold harmless Phalanx Cyber Academy from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from your use of the Service or violation of these Terms.
        </P>
      </Section>

      <Section title="10. Termination">
        <SubSection title="10.1 Termination by You">
          <P>
            You may terminate your account at any time by contacting us or using the account deletion feature if available.
          </P>
        </SubSection>
        <SubSection title="10.2 Termination by Us">
          <P>
            We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
          </P>
        </SubSection>
      </Section>

      <Section title="11. Governing Law">
        <P>
          These Terms shall be interpreted and governed by the laws of the Republic of the Philippines. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of the Philippines.
        </P>
      </Section>

      <Section title="12. Changes to the Terms of Service">
        <P className="mb-4">
          We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the new Terms on this page.
        </P>
        <Callout color="yellow" title="Terms Change Notice Period" icon={<Calendar className="h-5 w-5" />}>
          <strong>Important:</strong> Any changes to these Terms of Service will take effect 14 days after the updated terms are posted on this page. This 14-day notice period allows you time to review the changes and decide whether to continue using our services. Your continued use of our services after the 14-day period constitutes acceptance of the updated terms.
        </Callout>
      </Section>

      <Section title="13. Contact Information">
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl mb-6">
          <P className="mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </P>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> legal@example.com</p>
            <p><strong>Address:</strong> [Your Company Address]</p>
            <p><strong>Phone:</strong> [Your Contact Number]</p>
          </div>
        </div>
        <Callout color="green">
          <strong>Last Updated:</strong> {updated} • These terms are governed by Philippine law and comply with applicable regulations.
        </Callout>
      </Section>
    </PolicyLayout>
  );
}
