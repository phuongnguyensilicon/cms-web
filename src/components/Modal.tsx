import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: (action: boolean) => void;
  title: string;
  children?: any;
}

const Modal = ({ isOpen, onClose, title, children }: Props) => {
  const [, setIsOpenLocal] = useState(false);

  const handleClose = (action: boolean) => {
    setIsOpenLocal(false);
    onClose(action);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={e => handleClose(e)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="modal px-1 py-3 flex flex-col relative transform rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 w-[500px] h-[530px] overflow-auto">
                <div className="modal__header flex items-center mb-3 px-3">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-[rgba(255,255,255,0.6)]"
                    >
                      {title}
                    </Dialog.Title>
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
                <div className="modal__body">
                  <div className="h-full flex flex-col text-center sm:ml-4 sm:mt-0 sm:text-left">
                    {children}
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

export default Modal;
