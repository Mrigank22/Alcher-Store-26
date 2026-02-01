import Script from "next/script";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alcheringa Store',
  description: 'Alcheringa is the annual cultural festival of IIT Guwahati, Asia\'s largest college fest with 100+ events, competitions, pro-nites, and performances by top artists. Join the celebration and experience music, dance, drama, fashion, and cultural diversity at Alcheringa, IIT Guwahati, held every January. Preorder Now to get the Ultimate Merchandise and stylish accessories.',
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "Alcheringa",
    "IIT Guwahati",
    "cultural festival",
    "college fest",
    "India",
    "Asia",
    "competitions",
    "pro-nites",
    "music",
    "dance",
    "drama",
    "fashion show",
    "vogue nation",
    "rocko phonix",
    "parliamentary debate",
    "business events",
    "student festival",
    "Guwahati",
    "Assam",
    "2026",
    "annual fest",
    "youth festival",
    "college event"
  ],
  openGraph: {
    title: "Alcheringa, IIT Guwahati – Asia's Largest College Cultural Festival",
    description:
        "Alcheringa is the annual cultural festival of IIT Guwahati, Asia's largest college fest with 100+ events, competitions, Pro-nites, Creator's Camp and performances by top artists. Join the celebration and experience music, dance, drama, fashion, and cultural diversity at Alcheringa, IIT Guwahati, held every January.",
    url: "https://alcheringa.co.in",
    type: "website",
    images: [
      {
        url: "https://alcheringa.co.in/Alcher_logo.png",
        width: 1200,
        height: 630,
        alt: "Alcheringa IIT Guwahati Cultural Fest Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Alcheringa, IIT Guwahati – Asia's Largest College Cultural Festival",
    description: "Join Alcheringa at IIT Guwahati for electrifying performances, competitions, music, dance, drama, fashion, and cultural celebration each January.",
    site: "@alcheringaiitg",
    creator: "@alcheringaiitg",
    images: ["https://alcheringa.co.in/Alcher_logo.png"],
  },
  icons: {
    icon: [
      { url: '/icon.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/mobile_icon.ico', sizes: '16x16', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="en">
      <head>
        <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-715TH1X9MV"
            strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-715TH1X9MV');
                    `}
        </Script>
      </head>
      <body>
      {children}
      </body>
      </html>
  );
}