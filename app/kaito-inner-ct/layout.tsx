import "./kaito-inner-ct.css";

export default function KaitoInnerCTlayout({
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