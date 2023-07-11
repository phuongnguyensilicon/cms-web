/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { ROUTERS } from '@configs/common';
import '@scss/welcome.scss';
import LogoSVG from '@svg/clixtv-logo.svg';
import CloseSVG from '@svg/close.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  handleClick: any;
}
const WelcomeModal = ({ handleClick }: Props) => {
  const router = useRouter();

  return (
    <div className="welcome">
      <div>
        <button
          type="button"
          className="close"
          onClick={() => handleClick(false)}
        >
          <Image src={CloseSVG} alt="close" />
          <span className="sr-only">Close modal</span>
        </button>

        <div className="body">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Welcome to
          </h3>
          <Image src={LogoSVG} alt="clixtv-logo" />
          <div>
            <div>
              <img
                src="/images/welcome1.png"
                alt="clixtv-logo"
                width={177}
                height={245.32}
              />
            </div>
            <div className="self-center">
              <h4>Find great titles fast</h4>
              <p>
                At Clix, we bring you hand-picked content tailored to your
                preferences based on user data. Our selection ensures that you
                will discover excellent titles that align with your interests
                and captivate your attention.
              </p>
            </div>
          </div>
          <div>
            <div className="self-center">
              <h4>Earn Rewards</h4>
              <p>
                At Clix, you can earn Clix Points simply by providing feedback
                on TV shows and movies you've watched, then redeem exclusive
                rewards!
              </p>
            </div>
            <div>
              <img
                src="/images/welcome2.png"
                alt="clixtv-logo"
                width={177}
                height={245.32}
              />
            </div>
          </div>
          <div>
            <div>
              <img
                src="/images/welcome3.png"
                alt="clixtv-logo"
                width={177}
                height={245.32}
              />
            </div>
            <div className="self-center">
              <h4>AI-Powered Recommendations</h4>
              <p>
                Our AI technology tailors personalized recommendations based on
                your feedback and viewing habits. Discover new and exciting
                content that aligns with your unique interests.
              </p>
            </div>
          </div>
        </div>
        <div className="buttons">
          <button
            className="signup"
            onClick={() => router.push(ROUTERS.signup)}
          >
            Sign Up
          </button>
          <button onClick={() => router.push(ROUTERS.login)}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
