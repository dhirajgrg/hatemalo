import { useState } from "react";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineLocationMarker,
  HiOutlineCheckCircle,
} from "react-icons/hi";

const WHATSAPP_NUMBER = "9779768033768";
const EMAIL = "gdhiraj030@gmail.com";

const contactMethods = [
  {
    icon: <HiOutlineMail className="w-6 h-6 text-primary-600" />,
    label: "Email Us",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    description: "We usually reply within 24 hours.",
  },
  {
    icon: <HiOutlineChatAlt2 className="w-6 h-6 text-primary-600" />,
    label: "WhatsApp",
    value: `+977 9768033768`,
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    description: "Chat with us on WhatsApp.",
    external: true,
  },
  {
    icon: <HiOutlineLocationMarker className="w-6 h-6 text-primary-600" />,
    label: "Location",
    value: "Kathmandu, Nepal",
    description: "Serving buyers and sellers all over Nepal.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Open mailto with prefilled content
    const body = `Name: ${name}\n\n${message}`;
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject || "Contact from Hatemalo")}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary-100 text-primary-700 rounded-full mb-4">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-text-primary mb-4">
          Contact Us
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Have a question, feedback, or need help? We're here for you. Reach us
          through any of the channels below or send us a message directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Methods */}
        <div className="lg:col-span-2 space-y-4">
          {contactMethods.map((method) => (
            <div
              key={method.label}
              className="bg-surface-alt rounded-xl border border-border p-5 flex gap-4 items-start"
            >
              <div className="w-11 h-11 flex-shrink-0 bg-primary-50 rounded-lg flex items-center justify-center">
                {method.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-0.5">
                  {method.label}
                </p>
                {method.href ? (
                  <a
                    href={method.href}
                    target={method.external ? "_blank" : undefined}
                    rel={method.external ? "noopener noreferrer" : undefined}
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors break-all"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="font-semibold text-text-primary">
                    {method.value}
                  </p>
                )}
                <p className="text-sm text-text-secondary mt-0.5">
                  {method.description}
                </p>
              </div>
            </div>
          ))}

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <HiOutlineChatAlt2 className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3 bg-surface rounded-2xl border border-border p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <HiOutlineCheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Message Opened!
              </h3>
              <p className="text-text-secondary">
                Your email client should have opened with your message
                pre-filled. Send it from there to complete your enquiry.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", subject: "", message: "" });
                }}
                className="mt-6 text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Ram Sharma"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="ram@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Write your message here…"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
