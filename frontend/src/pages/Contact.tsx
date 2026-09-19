import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { FadeIn } from '../components/Animated';
import { Send, MapPin, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status !== 'idle') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    try {
      await api.post('/contact/', form);
      showToast('Message sent successfully!', 'success');
      setStatus('success');
      setStatusMessage('Thank you! Your message has been sent.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to send message. Please try again.';
      setStatus('error');
      setStatusMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header — transmission register on stock */}
      <section className="relative overflow-hidden bg-stock py-16 transition-colors duration-300 sm:py-20">
        <div className="dotfield absolute inset-0" aria-hidden="true" />
        <span className="absolute left-4 top-4 font-mono text-ink opacity-50 sm:left-6 sm:top-6" aria-hidden="true">+</span>
        <span className="absolute right-4 top-4 font-mono text-ink opacity-50 sm:right-6 sm:top-6" aria-hidden="true">+</span>
        <span className="absolute bottom-4 left-4 font-mono text-ink opacity-50 sm:bottom-6 sm:left-6" aria-hidden="true">+</span>
        <span className="absolute bottom-4 right-4 font-mono text-ink opacity-50 sm:bottom-6 sm:right-6" aria-hidden="true">+</span>

        <div className="relative z-10 mx-auto max-w-6xl px-5 text-center sm:px-8">
          <span className="register">Plate 01 — Communications</span>
          <h1 className="mb-5 mt-3 text-4xl font-extrabold tracking-tight text-ink opacity-0 animate-fade-in-up sm:text-6xl" style={{ animationFillMode: 'forwards' }}>Contact Us</h1>
          <p className="mx-auto max-w-3xl text-base text-ink-soft opacity-0 animate-fade-in-up sm:text-lg" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>We'd love to hear from you and discuss your next project</p>
        </div>
      </section>

      <section className="border-t border-hairline py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn delay="0.2s">
              <span className="register">Plate 02 — Transmission</span>
              <h2 className="mb-6 mt-3 text-3xl tracking-tight text-ink sm:text-4xl">Send us a Message</h2>

              {status === 'success' && (
                <div className="mb-6 flex items-center gap-3 border border-hairline border-l-2 border-l-confirm bg-stock p-4">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-confirm" />
                  <p className="text-sm text-ink">{statusMessage}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 flex items-center gap-3 border border-hairline border-l-2 border-l-strike bg-stock p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-strike" />
                  <p className="text-sm text-ink">{statusMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} />
                <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />
                <Field label="Subject" name="subject" type="text" value={form.subject} onChange={handleChange} />
                <div className="space-y-2">
                  <label htmlFor="message" className="register block">Message</label>
                  <textarea id="message" name="message" rows={6} value={form.message} onChange={handleChange} required placeholder="Enter your message"
                    className="w-full resize-y border border-hairline bg-stock px-4 py-3 text-ink transition-colors placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[44px] w-full items-center justify-center bg-ink px-8 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink hover:text-stock focus:outline-none focus:ring-2 focus:ring-seal-ink disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-seal dark:hover:text-seal-ink"
                >
                  {loading ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="mr-3 h-4 w-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </FadeIn>

            <FadeIn delay="0.3s">
              <span className="register">Plate 03 — Channels</span>
              <h2 className="mb-6 mt-3 text-3xl tracking-tight text-ink sm:text-4xl">Get in Touch</h2>
              <div className="space-y-6">
                <div className="plate reg-corners flex items-start gap-4 p-5 pt-9 transition-colors hover:border-ink sm:p-6 sm:pt-9">
                  <span className="plate-id absolute left-3 top-3">LOC-01</span>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-seal text-seal-ink">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Address</h3>
                    <address className="mt-1 text-ink-soft not-italic">
                      Phalanx Cyber Academy HQ, Makati City, Metro Manila, Philippines
                    </address>
                  </div>
                </div>

                <div className="plate reg-corners flex items-start gap-4 p-5 pt-9 transition-colors hover:border-ink sm:p-6 sm:pt-9">
                  <span className="plate-id absolute left-3 top-3">COM-01</span>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-seal text-seal-ink">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Email</h3>
                    <a href="mailto:contact@example.com" className="mt-1 block text-seal-ink underline underline-offset-[3px] transition-colors">
                      contact@example.com
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type, value, onChange }: { label: string; name: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="register block">{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} required
        className="w-full border border-hairline bg-stock px-4 py-3 text-ink transition-colors placeholder:text-ink-soft/60 focus:border-seal-ink focus:outline-none focus:ring-2 focus:ring-seal-ink" />
    </div>
  );
}
