import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/lib/tanstack-query-provider";


import { SidebarComponent } from "@/components/sidebar/sidebar-component";
import Image from "next/image";
import { UserNavWrapper } from "@/components/sidebar/user-nav-wrapper";
import { adminBreadcrumb, adminNavigation } from "@/components/ui/navigation";
import { ConditionalLayout } from "@/components/layout/conditional-layout";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <ConditionalLayout
            logo={<Image src="/logo.jpeg" alt="Logo" width={100} height={100} />}
            companyName="AI Career Assistant"
            navigationItems={adminNavigation}
            headerUserNav={<UserNavWrapper />}
            breadcrumbItems={{ items: adminBreadcrumb }}
          >
            {children}
          </ConditionalLayout>
        </QueryProvider>
      </body>
    </html>
  );
}



