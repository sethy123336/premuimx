import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is PremiumX?",
    answer:
      "PremiumX is a platform that allows you to fund trading accounts, manage crypto, access AI insights, and track your trading performance in one place.",
  },
  {
    question: "How do I fund my trading account?",
    answer:
      "You can fund your account by depositing funds into your wallet and transferring them directly to your trading account.",
  },
  {
    question: "Does PremiumX support cryptocurrency?",
    answer:
      "Yes, you can store, send, and manage crypto assets securely within the platform.",
  },
  {
    question: "What is the AI Advisor?",
    answer:
      "The AI Advisor provides trading insights, risk guidance, and strategy support to help you make better decisions.",
  },
  {
    question: "Can I track my trades?",
    answer:
      "Yes, PremiumX includes a trading journal that helps you log trades and analyze your performance over time.",
  },
  {
    question: "Is PremiumX secure?",
    answer:
      "Yes, PremiumX is built with strong security measures to protect user funds and data.",
  },
  {
    question: "Can I withdraw my funds anytime?",
    answer:
      "Yes, you can withdraw your funds at any time, subject to processing and verification.",
  },
  {
    question: "Who is PremiumX for?",
    answer:
      "PremiumX is built for traders who want a simple way to manage funding, assets, and performance in one platform.",
  },
];

const FAQSection = () => {
  return (
    <section className="w-full px-6 py-20 bg-background">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary text-center mb-12">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-xl px-6 bg-card data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
