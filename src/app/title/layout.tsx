import MainLayout from '@components/MainLayout';
import MainLayoutProvider from '@providers/MainLayoutProvider';
export const metadata = {
  title: 'Locked carousel',
  description: ''
};

export default function TitleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayoutProvider>
      <MainLayout>{children}</MainLayout>
    </MainLayoutProvider>
  );
}
