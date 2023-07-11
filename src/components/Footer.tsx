'use client';
import LogoSVG from '@svg/clixtv-logo.svg';
import FacebookSVG from '@svg/facebook-o.svg';
import InstagramSVG from '@svg/instagram.svg';
import TwitterSVG from '@svg/twitter.svg';
import YoutubeSVG from '@svg/youtube.svg';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer>
      <div className="logo">
        <Image src={LogoSVG} alt="clixtv-logo" />
      </div>
      <div className="links">
        <a href="#">Resources</a>
        <a href="#">About Us</a>
        <a href="#">Contact</a>
      </div>
      <div className="socials">
        <a href="#">
          <Image src={FacebookSVG} alt="Facebook" />
        </a>
        <a href="#">
          <Image src={TwitterSVG} alt="Twitter" />
        </a>
        <a href="#">
          <Image src={YoutubeSVG} alt="Youtube" />
        </a>
        <a href="#">
          <Image src={InstagramSVG} alt="Instagram" />
        </a>
      </div>
      <div>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
      </div>
    </footer>
  );
}
