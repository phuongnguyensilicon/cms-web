import Image from 'next/image';

export default function Logo({ w, h }: { w?: number; h?: number }) {
  return (
    <Image
      src="/clix_logo_header.png"
      width={w || 95}
      height={h || 30}
      alt="logo"
      loading="eager"
    ></Image>
  );
}
