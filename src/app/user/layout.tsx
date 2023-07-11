import MainLayout from '@components/MainLayout';
import MainLayoutProvider from '@providers/MainLayoutProvider';
import '@scss/title.scss';
export const metadata = {
  title: "User's Profile",
  description: ''
};

export default function UserLayout({
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
