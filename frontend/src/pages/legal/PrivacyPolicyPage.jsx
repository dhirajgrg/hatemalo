const EMAIL = "gdhiraj030@gmail.com";
const LAST_UPDATED = "March 24, 2026";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you register on Hatemalo, we collect your name, email address, and password (stored as a secure hash). If you sign in via Google, we receive your public profile data from Google.",
      },
      {
        subtitle: "Listing Information",
        text: "When you post a listing, we collect the details you provide: title, description, price, category, location, images, and any other fields relevant to the listing type.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you use the platform, including pages viewed, search queries, and device/browser information to help improve our service.",
      },
      {
        subtitle: "Communications",
        text: "If you contact us via email or WhatsApp, we retain that correspondence to assist you and improve our support.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    bullets: [
      "To create and manage your account securely.",
      "To display your listings to potential buyers.",
      "To send you transactional emails (e.g., account verification, password reset).",
      "To enforce our Terms of Service and keep the platform safe.",
      "To analyse usage trends and improve the platform.",
      "To respond to your customer support enquiries.",
    ],
  },
  {
    id: "sharing",
    title: "3. Sharing of Information",
    content: [
      {
        text: "We do not sell your personal data. We share information only in the following limited circumstances:",
      },
      {
        bullets: [
          "With service providers (e.g., cloud hosting, image delivery via ImageKit) who help us operate the platform under strict confidentiality agreements.",
          "When required by law, regulation, or valid legal process.",
          "To protect the rights, safety, or property of Hatemalo, our users, or the public.",
        ],
      },
    ],
  },
  {
    id: "data-storage",
    title: "4. Data Storage & Security",
    content: [
      {
        text: "Your data is stored on secure servers. Passwords are hashed using industry-standard algorithms and are never stored in plain text. We use HTTPS to encrypt data in transit. While we apply reasonable security measures, no internet transmission is 100% secure, and we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "cookies",
    title: "5. Cookies & Local Storage",
    content: [
      {
        text: "We use browser local storage to keep you logged in and to remember your preferences. We may use analytics cookies to understand how visitors interact with the site. You can configure your browser to reject cookies, but some features may not function correctly.",
      },
    ],
  },
  {
    id: "third-party",
    title: "6. Third-Party Services",
    bullets: [
      "Google OAuth — for social login. Subject to Google's Privacy Policy.",
      "ImageKit — for image hosting and optimisation.",
      "OpenStreetMap / Leaflet — for map functionality.",
    ],
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    bullets: [
      "Access the personal data we hold about you.",
      "Correct inaccurate data via your profile settings.",
      "Delete your account and associated data by contacting us.",
      "Withdraw consent for email communications at any time.",
    ],
    footer: `To exercise any of these rights, please contact us at ${EMAIL}.`,
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: [
      {
        text: "Hatemalo is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with their data, please contact us so we can remove it.",
      },
    ],
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: [
      {
        text: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of Hatemalo after changes constitutes acceptance of the revised policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    content: [
      {
        text: `If you have any questions about this Privacy Policy, please contact us at ${EMAIL}.`,
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary-100 text-primary-700 rounded-full mb-4">
          Legal
        </span>
        <h1 className="text-4xl font-extrabold text-text-primary mb-3">
          Privacy Policy
        </h1>
        <p className="text-text-secondary">
          Last updated: <span className="font-medium">{LAST_UPDATED}</span>
        </p>
        <p className="mt-4 text-text-secondary leading-relaxed">
          At Hatemalo, your privacy matters to us. This policy explains what
          personal data we collect, why we collect it, and how we protect it. By
          using Hatemalo, you agree to the practices described below.
        </p>
      </div>

      {/* TOC */}
      <div className="bg-surface-alt border border-border rounded-xl p-6 mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
          Table of Contents
        </h2>
        <ol className="space-y-1.5 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id}>
            <h2 className="text-xl font-bold text-text-primary mb-4 border-b border-border pb-2">
              {s.title}
            </h2>

            {/* Subsections */}
            {s.content &&
              s.content.map((item, i) => (
                <div key={i} className="mb-4">
                  {item.subtitle && (
                    <h3 className="font-semibold text-text-primary mb-1">
                      {item.subtitle}
                    </h3>
                  )}
                  {item.text && (
                    <p className="text-text-secondary leading-relaxed">
                      {item.text}
                    </p>
                  )}
                  {item.bullets && (
                    <ul className="list-disc list-inside space-y-1 text-text-secondary mt-2">
                      {item.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

            {/* Top-level bullets */}
            {s.bullets && (
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}

            {s.footer && (
              <p className="mt-4 text-text-secondary leading-relaxed">
                {s.footer}
              </p>
            )}
          </section>
        ))}
      </div>

      {/* Bottom contact */}
      <div className="mt-12 bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
        <p className="text-text-secondary">
          Questions about your privacy?{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
