import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: April 10, 2026</p>

        <div className="space-y-8 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>Welcome to PremiumX. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, and other contact details you provide during registration.</li>
              <li><strong className="text-foreground">Financial Information:</strong> Payment details, transaction history, and wallet information necessary for funding and trading activities.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, and time spent.</li>
              <li><strong className="text-foreground">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our services, including funding accounts, crypto management, and AI insights.</li>
              <li>To process transactions and manage your trading accounts.</li>
              <li>To personalize your experience and deliver relevant AI-driven trading insights.</li>
              <li>To communicate with you about updates, promotions, and support.</li>
              <li>To comply with legal obligations and prevent fraudulent activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal and financial data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Third-Party Services</h2>
            <p>We may share your information with trusted third-party service providers who assist us in operating our platform, processing payments, and delivering services. These parties are obligated to keep your information confidential.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time by contacting us at support@premiumx.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@premiumx.com" className="text-primary hover:underline">support@premiumx.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
