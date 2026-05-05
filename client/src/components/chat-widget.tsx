import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, CheckCircle2, ChevronDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiRequest("POST", "/api/contact-submissions", {
        type: "general-contact",
        name: data.name,
        email: data.email,
        phone: data.phone,
        reason: "Website Chat",
        message: data.message,
      }),
    onSuccess: () => {
      setSent(true);
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!form.email.trim() && !form.phone.trim()) e.email = "Please enter an email or phone number";
    if (!form.message.trim()) e.message = "Please enter a message";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate(form);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    }, 300);
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={handleClose}
        />
      )}

      {/* Chat panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[370px] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 outline-none ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ backgroundColor: "#fff" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5" style={{ backgroundColor: NAVY }}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: PINK }}>Chat with us</div>
              <div className="text-xl font-extrabold text-white leading-tight">Hi there!</div>
              <div style={{ ...SCRIPT, fontSize: "1.3rem", color: PINK }}>how can we help?</div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">
            Leave us a message and a member of our team will get back to you as soon as possible.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${PINK}15` }}>
                <CheckCircle2 size={28} style={{ color: PINK }} />
              </div>
              <p className="font-extrabold text-base mb-1" style={{ color: NAVY }}>Message sent!</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                Thank you for getting in touch. We'll be back in touch with you shortly.
              </p>
              <button
                onClick={handleClose}
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105"
                style={{ backgroundColor: PINK }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div>
                <input
                  type="text"
                  placeholder="Your name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
                  style={{ borderColor: errors.name ? PINK : "#e5e7eb", backgroundColor: CREAM }}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: PINK }}>{errors.name}</p>}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
                  style={{ borderColor: errors.email ? PINK : "#e5e7eb", backgroundColor: CREAM }}
                />
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors"
                  style={{ borderColor: errors.email ? PINK : "#e5e7eb", backgroundColor: CREAM }}
                />
                {errors.email && <p className="text-xs mt-1" style={{ color: PINK }}>{errors.email}</p>}
              </div>

              <div>
                <textarea
                  placeholder="Your message *"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors resize-none"
                  style={{ borderColor: errors.message ? PINK : "#e5e7eb", backgroundColor: CREAM }}
                />
                {errors.message && <p className="text-xs -mt-1" style={{ color: PINK }}>{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
                style={{ backgroundColor: PINK, boxShadow: "0 6px 20px rgba(239,42,134,0.35)" }}
              >
                {mutation.isPending ? (
                  "Sending..."
                ) : (
                  <>Send message <Send size={14} /></>
                )}
              </button>

              {mutation.isError && (
                <p className="text-xs text-center" style={{ color: PINK }}>
                  Something went wrong. Please try again or call us on 0330 165 8880.
                </p>
              )}

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Or call us on{" "}
                <a href="tel:03301658880" className="font-bold" style={{ color: BLUE }}>
                  0330 165 8880
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all"
        style={{ backgroundColor: PINK, boxShadow: "0 8px 28px rgba(239,42,134,0.5)" }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <ChevronDown size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
