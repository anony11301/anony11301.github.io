export const metadata = {
  title: 'Fredrik & Wulan',
  description: 'Our Gallery',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/css/tooplate-style.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
