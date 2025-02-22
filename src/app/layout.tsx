import { Suspense } from "react";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <ClerkProvider>
        <html lang="en">
          <body className={`antialiased`}>
            {children}

            <Toaster />
          </body>
        </html>
      </ClerkProvider>
    </Suspense>
  );
}
