import { Dialog, Transition } from '@headlessui/react';
import { toIframeSrc } from '@helpers/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import Video from './Video';

interface Props {
  isOpen: boolean;
  onClose: (action: boolean) => void;
  options: { key: string; site: string };
}

const VideoPopupPlayer = ({ isOpen, onClose, options }: Props) => {
  const [, setIsOpenLocal] = useState(false);

  const handleClose = (action: boolean) => {
    setIsOpenLocal(false);
    onClose(action);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[51]"
        onClose={e => handleClose(e)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 transition-opacity bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-2 text-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="modal_player flex flex-col relative transform text-left shadow-xl transition-all mx-auto max-w-[500px] w-full overflow-auto">
                <div className="modal__header flex items-center mb-3 px-3">
                  <div className="absolute right-0 top-0 pr-1 pt-4">
                    <button
                      type="button"
                      className="rounded-md text-[#929292] hover:text-gray-500 "
                      onClick={() => handleClose(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="modal__body">
                  <div className="h-full flex flex-col text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Video
                      src={toIframeSrc(options.key, options.site, true)}
                      width={'100%'}
                      height={'210px'}
                    ></Video>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default VideoPopupPlayer;
