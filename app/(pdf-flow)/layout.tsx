import { PDFProvider } from '@/context/PDFContext';

export default function PDFFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PDFProvider>{children}</PDFProvider>;
}
