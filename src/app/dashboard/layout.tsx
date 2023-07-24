/* eslint-disable @next/next/no-img-element */
"use client";

import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  FilmIcon,
  QueueListIcon
} from "@heroicons/react/20/solid";
import {
  Bars3CenterLeftIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

const defaultAvtUrl =
  "https://cdn2.clixtv.com/media/2022/01/19/4962260-thumb148.png";
const navigation = [
  {
    name: "Import Titles",
    href: "/dashboard/import-titles",
    icon: QueueListIcon,
    current: false
  },
  {
    name: "Title Library",
    href: "/dashboard/titles",
    icon: FilmIcon,
    current: false
  },
  {
    name: "Lists",
    href: "/dashboard/lists",
    icon: FilmIcon,
    current: false
  },
  {
    name: "Promotional",
    href: "/dashboard/promos-ads",
    icon: FilmIcon,
    current: false
  },
  {
    name: "Contests",
    href: "/dashboard/contests",
    icon: FilmIcon,
    current: false
  },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null) as any;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    setUser(data?.user);
  }, [data, router, status]);

  if (status === "unauthenticated") {
    router.push("/login");
    return;
  }

  return (
    <div className="min-h-full relative">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4 pt-5">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute right-0 top-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex flex-shrink-0 items-center px-4">
                  ClixTV Admin
                </div>
                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="px-2">
                    <div className="space-y-1">
                      {navigation.map(item => {
                        const isCurrentPage = item.href === pathname;

                        return (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              isCurrentPage
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                              "group flex items-center rounded-md px-2 py-2 text-base font-medium leading-5"
                            )}
                            aria-current={isCurrentPage ? "page" : undefined}
                          >
                            {/* <item.icon
                              className={classNames(
                                isCurrentPage
                                  ? "text-gray-500"
                                  : "text-gray-400 group-hover:text-gray-500",
                                "mr-3 h-6 w-6 flex-shrink-0"
                              )}
                              aria-hidden="true"
                            /> */}
                            {item.name}
                          </a>
                        );
                      })}
                    </div>
                    <div className="mt-8">
                      <h3
                        className="px-3 text-sm font-medium text-gray-500"
                        id="mobile-teams-headline"
                      >
                        Teams
                      </h3>
                      <div
                        className="mt-1 space-y-1"
                        role="group"
                        aria-labelledby="mobile-teams-headline"
                      ></div>
                    </div>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-52 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-100 lg:pb-4 lg:pt-5">
        <div className="flex flex-shrink-0 items-center px-6 font-bold">
          ClixTV Admin
        </div>
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
          {/* User account dropdown */}
          <Menu as="div" className="relative inline-block px-3 text-left">
            <div>
              <Menu.Button className="group w-full rounded-md bg-gray-100 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                <span className="flex w-full items-center justify-between">
                  <span className="flex min-w-0 items-center justify-between space-x-3">
                    <img
                      className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
                      src={defaultAvtUrl}
                      alt=""
                    />
                    <span className="flex flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {user?.name}
                      </span>
                      <span className="truncate text-sm text-gray-500">
                        {user?.email}
                      </span>
                    </span>
                  </span>
                  <ChevronUpDownIcon
                    className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </span>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 right-0 z-10 mx-3 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        View profile
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                        onClick={e => {
                          e.preventDefault();
                          logout();
                        }}
                      >
                        Logout
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          {/* Navigation */}
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {navigation.map(item => {
                const isCurrentPage = item.href === pathname;

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      isCurrentPage
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                    aria-current={isCurrentPage ? "page" : undefined}
                  >
                    {/* <item.icon
                      className={classNames(
                        isCurrentPage
                          ? "text-gray-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    /> */}
                    {item.name}
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
      {/* Main column */}
      <div className="flex flex-col lg:pl-52">
        {/* Search header */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white lg:hidden">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1">
              {/* <form className="flex w-full md:ml-0" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <MagnifyingGlassIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="search-field"
                    name="search-field"
                    className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-0 focus:placeholder:text-gray-400 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </form> */}
            </div>
            <div className="flex items-center">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src={defaultAvtUrl}
                      alt=""
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            View profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            Settings
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm"
                            )}
                            onClick={e => {
                              e.preventDefault();
                              logout();
                            }}
                          >
                            Logout
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
        <main className="flex-1">
          <div className="mt-5 px-4 sm:px-6 lg:px-8 pb-3">{children}</div>
        </main>
      </div>
    </div>
  );
}
