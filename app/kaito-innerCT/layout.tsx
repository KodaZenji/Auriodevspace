import "./kaito-innerCT.css";

export default function KaitoInnerCTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="kaito-app">
        {children}
      </body>
    </html>
  );
}