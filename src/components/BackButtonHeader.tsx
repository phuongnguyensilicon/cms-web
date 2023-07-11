'use client';
import { getUrlBack, ROUTERS } from '@configs/common';
import BackPNG from '@images/back-btn.png';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function BackButtonHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const goBack = () => {
    const urlBack = getUrlBack(pathname);
    if (!urlBack) {
      router.back();
    } else {
      router.push(urlBack);
    }
  };

  return (
    <div className="back-header">
      <div className="back" onClick={goBack}>
        {pathname !== ROUTERS.userProfileSetup && (
          <>
            <Image src={BackPNG} alt="back" width={15} height={15} />
            Back
          </>
        )}
      </div>
    </div>
  );
}
