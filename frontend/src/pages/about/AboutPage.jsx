import { Link } from "react-router-dom";
import {
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineLightBulb,
  HiOutlineGlobeAlt,
  HiOutlineHeart,
} from "react-icons/hi";

const values = [
  {
    icon: <HiOutlineShieldCheck className="w-7 h-7 text-primary-600" />,
    title: "Trust & Safety",
    description:
      "We verify listings and provide secure messaging so every transaction feels safe and transparent.",
  },
  {
    icon: <HiOutlineUserGroup className="w-7 h-7 text-primary-600" />,
    title: "Community First",
    description:
      "Hatemalo is built for Nepali people, by Nepali people. Every feature is designed around real local needs.",
  },
  {
    icon: <HiOutlineLightBulb className="w-7 h-7 text-primary-600" />,
    title: "Innovation",
    description:
      "We continuously improve our platform with new features, AI-assisted listings, and smart search tools.",
  },
  {
    icon: <HiOutlineGlobeAlt className="w-7 h-7 text-primary-600" />,
    title: "Accessibility",
    description:
      "Available on any device, anywhere in Nepal — so no one misses a great deal or opportunity.",
  },
  {
    icon: <HiOutlineShoppingBag className="w-7 h-7 text-primary-600" />,
    title: "Local Commerce",
    description:
      "We empower small sellers and local businesses to reach buyers across the country with ease.",
  },
  {
    icon: <HiOutlineHeart className="w-7 h-7 text-primary-600" />,
    title: "Passion",
    description:
      "Every line of code and every design decision reflects our deep love for Nepal and its vibrant communities.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary-100 text-primary-700 rounded-full mb-4">
          About Hatemalo
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-5 leading-tight">
          Nepal's #1 Online Marketplace
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Hatemalo connects buyers and sellers across Nepal in one trusted,
          easy-to-use platform — for everything from electronics and vehicles to
          jobs and services.
        </p>
      </div>

      {/* Story */}
      <div className="bg-surface-alt rounded-2xl border border-border p-8 mb-16">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Our Story</h2>
        <div className="space-y-4 text-text-secondary leading-relaxed">
          <p>
            Hatemalo was born from a simple frustration: buying and selling in
            Nepal was scattered across social media groups, WhatsApp chats, and
            outdated websites. There was no single, reliable place tailored for
            Nepali users.
          </p>
          <p>
            We set out to change that. Our team built Hatemalo to be the go-to
            marketplace for Nepal — a platform that understands local pricing,
            local locations, and local languages while delivering a modern,
            mobile-friendly experience.
          </p>
          <p>
            Today Hatemalo hosts thousands of listings across dozens of
            categories, helping everyday Nepalis find great deals and giving
            sellers a wider audience than ever before.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-primary-700 text-white text-center px-8 py-12">
        <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
        <p className="text-primary-200 mb-6">
          Join thousands of Nepalis already buying and selling on Hatemalo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/listings"
            className="inline-block bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Browse Listings
          </Link>
          <Link
            to="/register"
            className="inline-block border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
