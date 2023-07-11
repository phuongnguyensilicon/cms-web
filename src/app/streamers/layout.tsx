import MainLayout from '@components/MainLayout';
import MainLayoutProvider from '@providers/MainLayoutProvider';
import '@scss/carousel.scss';
export const metadata = {
  title: 'Streamers',
  description: ''
};

export default function StreamerLayout({
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
