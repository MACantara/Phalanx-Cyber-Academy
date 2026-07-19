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
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-teal-600 to-blue-600 py-20 transition-colors duration-300 dark:from-green-800 dark:via-teal-800 dark:to-blue-800">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-5xl font-bold text-white opacity-0 animate-fade-in-up md:text-6xl" style={{ animationFillMode: 'forwards' }}>Contact Us</h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-100 opacity-0 animate-fade-in-up md:text-2xl" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>We'd love to hear from you and discuss your next project</p>
        </div>
        <div className="absolute left-20 top-20 h-32 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="absolute bottom-20 right-20 h-40 w-40 animate-pulse rounded-full bg-yellow-400/10" style={{ animationDelay: '1s' }} />
      </section>

      <section className="bg-gradient-to-br from-white to-gray-50 py-20 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <FadeIn delay="0.2s">
              <h2 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>

              {status === 'success' && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <p>{statusMessage}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
                  <AlertCircle className="h-5 w-5" />
                  <p>{statusMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} />
                <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />
                <Field label="Subject" name="subject" type="text" value={form.subject} onChange={handleChange} />
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Message</label>
                  <textarea id="message" name="message" rows={6} value={form.message} onChange={handleChange} required placeholder="Enter your message"
                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all hover:shadow-md focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full transform items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-teal-700 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="mr-3 h-5 w-5" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </FadeIn>

            <FadeIn delay="0.3s">
              <h2 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Address</h3>
                    <address className="mt-1 text-gray-600 dark:text-gray-300 not-italic">
                      Phalanx Cyber Academy HQ, Makati City, Metro Manila, Philippines
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-orange-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-600">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email</h3>
                    <a href="mailto:contact@example.com" className="mt-1 block text-gray-600 transition-colors hover:text-orange-500 dark:text-gray-300">
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
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} required
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all hover:shadow-md focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400" />
    </div>
  );
}
