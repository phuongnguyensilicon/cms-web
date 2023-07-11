import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: (action: boolean) => void;
  title?: string;
  children?: any;
}

const Popup = ({ isOpen, onClose, title, children }: Props) => {
  const [, setIsOpenLocal] = useState(false);

  const handleClose = (action: boolean) => {
    setIsOpenLocal(false);
    onClose(action);
  };

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.7)] bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="absolute top-0 left-0 right-0 z-10 overflow-y-auto">
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
              <div className="modal px-1 py-3 flex flex-col relative transform rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-[500px] max-h-[700px] min-h-[420px] overflow-auto">
                <div className="modal__header flex items-center mb-2 px-3">
                  <div>
                    <h3 className="text-base font-semibold leading-6 text-[rgba(255,255,255,0.6)]">
                      {title}
                    </h3>
                  </div>
                  <div className="absolute right-0 top-0 pr-2 pt-2 sm:block">
                    <button
                      type="button"
                      className="rounded-md text-[#929292] hover:text-gray-500"
                      onClick={() => handleClose(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="modal__body overflow-hidden">
                  <div className="h-full flex flex-col text-center">
                    {children}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Transition.Root>
  );
};

export default Popup;
