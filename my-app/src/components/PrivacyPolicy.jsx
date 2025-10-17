import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm opacity-90 mt-1">Last Updated: October 10, 2025</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 leading-relaxed space-y-10">
        <section>
          <p>
            Welcome to <strong>MedTracker</strong> (“we,” “our,” or “us”). Your privacy is
            important to us. This Privacy Policy explains how we collect, use,
            disclose, and protect your personal information when you use the
            MedTracker web and mobile applications (the “Service”).
          </p>
          <p className="mt-4">
            By accessing or using our Service, you agree to this Privacy Policy.
            If you do not agree, please do not use MedTracker.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            1. Information We Collect
          </h2>
          <p>We collect information to provide and improve our services.</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Personal Information:</strong> Name, email, phone, password (encrypted), and
              organization details.
            </li>
            <li>
              <strong>Usage Data:</strong> Device type, IP, browser, access logs, and app
              interaction patterns.
            </li>
            <li>
              <strong>Inventory Data:</strong> Medication names, quantities, expiry dates, and
              supplier information.
            </li>
          </ul>
          <p className="mt-2 italic text-sm text-gray-600">
            Note: We do not collect sensitive patient medical records.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Manage your MedTracker account and preferences.</li>
            <li>Provide alerts, reports, and inventory management tools.</li>
            <li>Enhance app performance and user experience.</li>
            <li>Respond to customer inquiries and support requests.</li>
            <li>Comply with legal and regulatory obligations.</li>
          </ul>
          <p className="mt-2">We never sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            3. Data Storage and Security
          </h2>
          <p>
            We store data securely using encryption and restricted access. SSL/TLS encryption is
            applied during transmission. Passwords are hashed for your protection. However, no
            digital system is 100% secure, and you share data at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            4. Sharing of Information
          </h2>
          <p>We share data only when necessary:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Service Providers:</strong> Trusted vendors like cloud hosts or email
              systems.
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by court order or government law.
            </li>
            <li>
              <strong>Business Transfers:</strong> In case of mergers or acquisitions.
            </li>
          </ul>
          <p className="mt-2">
            We do not share your information with advertisers or external marketers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            5. Cookies and Tracking
          </h2>
          <p>
            MedTracker may use cookies to maintain sessions, save preferences, and analyze usage.
            You can disable cookies, but some features may not work properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            6. Your Data Rights
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access, correct, or delete your personal data.</li>
            <li>Withdraw consent at any time.</li>
            <li>Request a copy of your stored information.</li>
            <li>Opt out of non-essential communications.</li>
          </ul>
          <p className="mt-2">
            Contact us at{" "}
            <a
              href="mailto:ngwainnocentnweselie3@gmail.com"
              className="text-blue-600 underline"
            >
              ngwainnocentnweselie3@gmail.com
            </a>{" "}
            to exercise your rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            7. Children’s Privacy
          </h2>
          <p>
            MedTracker is intended for users aged 16 and above. We do not knowingly collect
            information from children. If a child has provided data, please contact us for
            immediate removal.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            8. Third-Party Links
          </h2>
          <p>
            Our app may link to external sites. We are not responsible for their privacy
            practices—review their policies before sharing data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            9. Data Retention
          </h2>
          <p>
            We retain your information as long as necessary to deliver MedTracker services,
            fulfill legal duties, and resolve disputes. You can request account deletion anytime.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy periodically. All updates will appear on this page
            with a revised date. Continued use of MedTracker after changes means you accept the
            updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            11. Contact Us
          </h2>
          <p>
            For any questions or concerns, reach out to us at:
            <br />
            📧 <a href="mailto:ngwainnocentnweselie3@gmail.com" className="text-blue-600 underline">
              ngwainnocentnweselie3@gmail.com
            </a>
            <br />
            📞 (+237) 670661722
            <br />
            🏢 123 Health St, Wellness City, Cameroon
          </p>
        </section>

        <p className="text-center text-sm text-gray-500 pt-10">
          © 2025 MedTracker — All Rights Reserved.
        </p>
      </main>
    </div>
  );
}
