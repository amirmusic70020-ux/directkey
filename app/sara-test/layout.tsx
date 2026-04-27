export default function SaraTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SARA — DirectKey AI Test</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#030712' }}>
        {children}
      </body>
    </html>
  );
}
