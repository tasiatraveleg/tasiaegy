import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import DashboardShell from "./DashboardShell";

export default async function DashboardRootLayout({ children }) {
  const messages = await getMessages();

  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <DashboardShell>{children}</DashboardShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}