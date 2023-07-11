import MainLayout from '@components/MainLayout';
import MainLayoutProvider from '@providers/MainLayoutProvider';
import '@scss/title.scss';
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
      <MainLayout showStat={false}>{children}</MainLayout>
    </MainLayoutProvider>
  );
}
