import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms & Conditions</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: April 10, 2026</p>

        <div className="space-y-8 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using PremiumX, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, you may not use the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years of age to use PremiumX. By using the platform, you represent and warrant that you meet this requirement and have the legal capacity to enter into these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Account Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to provide accurate and complete information during registration.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Services</h2>
            <p>PremiumX provides tools for funding trading accounts, managing crypto assets, accessing AI-driven trading insights, and tracking trading performance. We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Trading Risks</h2>
            <p>Trading involves significant risk of loss. PremiumX does not provide financial advice. AI insights and analytics are for informational purposes only and should not be considered as investment recommendations. You are solely responsible for your trading decisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Fees & Payments</h2>
            <p>Certain services may be subject to fees. All applicable fees will be disclosed before you complete a transaction. You agree to pay all fees associated with your use of the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Prohibited Activities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Using the platform for any illegal or unauthorized purpose.</li>
              <li>Attempting to interfere with or disrupt the platform's security or functionality.</li>
              <li>Engaging in market manipulation or fraudulent trading activities.</li>
              <li>Sharing your account access with unauthorized individuals.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>PremiumX shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to trading losses, data loss, or service interruptions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in activities that may harm the platform or other users.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p>If you have any questions about these Terms & Conditions, please contact us at <a href="mailto:support@premiumx.com" className="text-primary hover:underline">support@premiumx.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
