'use client';
import { APIS, ROUTERS } from '@configs/common';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import '@scss/user.scss';
import { HttpClient } from '@services/http-client';
import AvatarSVG from '@svg/avatar.svg';
import PencilSVG from '@svg/pencil.svg';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

export default function UserMePage() {
  const router = useRouter();
  const { data: session, update: updatedSession }: any = useSession();
  const [avatar, setAvatar] = useState<string>();
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    if (session?.user) {
      const { user } = session;
      updatedSession({
        session,
        user: { ...user, avatar }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatar]);

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    try {
      const { data, statusCode } = await HttpClient.post<any>(
        APIS.fileAvatar,
        formData,
        config
      );
      if (statusCode === 200) {
        setAvatar(data.fileUrl);
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const { setConfig } = useMainLayoutContext();

  useEffectOnce(() => {
    setConfig({
      backHeader: {
        title: session?.user?.userName,
        action: { name: 'Edit', path: ROUTERS.userProfileUpdate }
      },
      showStat: false
    });
  });

  const goTo = (url: string) => {
    router.push(url);
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      signOut();
    }
  };

  return (
    <section id="user-me-page">
      <div className="avatar relative">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <Image
          onClick={handleButtonClick}
          className="pencil"
          src={PencilSVG}
          alt="pencil"
          width={51}
          height={51}
        />
        <Image
          src={session?.user?.avatar || session?.user?.picture || AvatarSVG}
          alt="avatar"
          width={180}
          height={180}
          className="object-cover"
        />
      </div>

      <div className="buttons">
        <button onClick={() => goTo(ROUTERS.userStreamers)}>
          My Streaming Services
        </button>
        <button onClick={() => goTo(ROUTERS.userWatchList)}>Watch List</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </section>
  );
}
