import MainLayout from '@components/MainLayout';
import MainLayoutProvider from '@providers/MainLayoutProvider';
import '@scss/market-place.scss';
export const metadata = {
  title: 'Market Place',
  description: ''
};

export default function MarketPlaceLayout({
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
