import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone } from "lucide-react";

export default async function ContactPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ContactPage");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="mb-14 max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-navy" />
            <span className="text-xs text-navy">{t("eyebrow")}</span>
          </div>
          <h1 className="font-display text-3xl italic leading-tight text-charcoal sm:text-4xl">
            {t.rich("heading", {
              highlight: (chunks) => (
                <span className="text-navy">{chunks}</span>
              ),
            })}
          </h1>
        </div>

        <div className="grid gap-14 lg:grid-cols-2">
          <ContactForm />

          <div className="space-y-6 text-sm text-charcoal/75">
            <div className="flex items-start gap-4">
              <Phone size={18} className="mt-0.5 text-navy" />
              <div>
                <p className="text-charcoal">{t("phone")}</p>
                <p className="mt-1">+5563992113055</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail size={18} className="mt-0.5 text-navy" />
              <div>
                <p className="text-charcoal">{t("emailContact")}</p>
                <p className="mt-1">tasiatraveleg@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}