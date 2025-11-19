'use client'

import Link from 'next/link';
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-white">
      <div className="max-w-[1030px] mx-auto xl:px-0 px-3 py-8 md:py-14 lg:py-20">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-[35px] md:text-[42px] font-semibold text-[#171717] leading-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl lg:text-[20px] text-[#5F5F5F] max-w-[700px] font-normal mx-auto leading-[24px]">
            Your data, your control — we collect only what&apos;s needed,<br className="hidden md:block" />
            keep it secure, and never share it without consent.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-8 lg:space-y-12">
          {/* Introduction Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              1. Introduction
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                EdgeAI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered video creation platform and services (the &quot;Service&quot;). By using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </section>

          {/* Information We Collect Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              2. Information We Collect
            </h2>
            
            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              2.1 Personal Information
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Business information (company name, industry, professional title)</li>
                <li>Account credentials (username and password)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Professional content and preferences for video creation</li>
                <li>Voice recordings and avatar images for personalized video creation</li>
              </ul>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              2.2 Automatically Collected Information
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                When you use our Service, we automatically collect:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>Usage data (features used, videos created, interaction patterns)</li>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Log data (access times, pages viewed, system performance)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              2.3 Third-Party Service Data
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We integrate with various third-party services that may collect:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>AI processing data through OpenAI, HeyGen, ElevenLabs, and Perplexity AI</li>
                <li>Video hosting and processing data through AWS</li>
                <li>Social media platform data when you connect accounts for publishing</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              3. How We Use Your Information
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We use the collected information to:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Create and deliver AI-generated videos based on your specifications</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information and service updates</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Monitor and analyze usage patterns to improve user experience</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing and Disclosure Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              4. Information Sharing and Disclosure
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:
              </p>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              4.1 Service Providers
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We share information with third-party service providers that perform services on our behalf:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>OpenAI: For script generation and content creation</li>
                <li>HeyGen: For AI avatar generation</li>
                <li>ElevenLabs: For voice synthesis and cloning</li>
                <li>Perplexity AI: For research and content ideation</li>
                <li>AWS: For video processing and storage</li>
                <li>Stripe: For payment processing</li>
                <li>MongoDB: For database services</li>
              </ul>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              4.2 Business Transfers
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              4.3 Legal Requirements
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities.
              </p>
            </div>
          </section>

          {/* Data Security Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              5. Data Security
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure API authentication</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication procedures</li>
                <li>Secure cloud infrastructure through AWS</li>
              </ul>
              <p className="!font-barlow mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Data Retention Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              6. Data Retention
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We retain your personal information for as long as necessary to provide you with our Service and as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. When you cancel your subscription, we will delete or anonymize your personal information within 90 days, except where retention is required by law.
              </p>
            </div>
          </section>

          {/* Your Rights and Choices Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              7. Your Rights and Choices
            </h2>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              7.1 Access and Update
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                You can review and update your personal information through your account settings or by contacting us.
              </p>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              7.2 Data Portability
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                You have the right to request a copy of your personal data in a structured, commonly used format.
              </p>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              7.3 Deletion
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                You may request deletion of your personal information by contacting us. Note that we may retain certain information as required by law or for legitimate business purposes.
              </p>
            </div>

            <h3 className="text-[18px] font-semibold text-[#2A2A2A] mb-2 mt-6">
              7.4 Marketing Communications
            </h3>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                You can opt-out of receiving promotional emails by following the unsubscribe instructions in those emails.
              </p>
            </div>
          </section>

          {/* California Privacy Rights Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              8. California Privacy Rights
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                California residents have additional rights under the California Consumer Privacy Act (CCPA), including:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>The right to know what personal information we collect</li>
                <li>The right to delete personal information</li>
                <li>The right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>The right to non-discrimination for exercising privacy rights</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              9. Children&apos;s Privacy
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
              </p>
            </div>
          </section>

          {/* International Data Transfers Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              10. International Data Transfers
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                Your information may be transferred to and processed in the United States where our servers are located. If you are accessing our Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located and our central database is operated.
              </p>
            </div>
          </section>

          {/* Third-Party Links Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              11. Third-Party Links
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information to them.
              </p>
            </div>
          </section>

          {/* Updates to This Privacy Policy Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              12. Updates to This Privacy Policy
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. For material changes, we will provide notice through the Service or via email.
              </p>
            </div>
          </section>

          {/* Contact Information Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              13. Contact Information
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="!font-barlow">
                <p><strong>EdgeAI</strong></p>
                <p>Email: <Link href="mailto:privacy@edgeai.com" className="text-[#0070D8] hover:underline">privacy@edgeai.com</Link></p>
                <p>Address: [Your Business Address]</p>
              </div>
              <p className="!font-barlow">
                For data protection inquiries, you may also contact our Data Protection Officer at: <Link href="mailto:dpo@edgeai.com" className="text-[#0070D8] hover:underline">dpo@edgeai.com</Link>
              </p>
            </div>
          </section>

          {/* Consent Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              14. Consent
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                By using our Service, you consent to our Privacy Policy and agree to its terms.
              </p>
            </div>
          </section>

          {/* Special Provisions for AI-Generated Content Section */}
          <section>
            <h2 className="text-[20px] font-bold text-[#2A2A2A] mb-3">
              Special Provisions for AI-Generated Content
            </h2>
            <div className="space-y-4 text-[#2A2A2A] text-base font-medium leading-[24px]">
              <p className="!font-barlow">
                You acknowledge that:
              </p>
              <ul className="list-disc !font-barlow pl-6 space-y-2">
                <li>AI-generated content may be retained for quality improvement and service optimization</li>
                <li>Voice clones and avatar data are processed through third-party AI services</li>
                <li>Generated videos remain your property, subject to our Terms of Service</li>
                <li>We implement measures to prevent the creation of inappropriate or harmful content</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;


