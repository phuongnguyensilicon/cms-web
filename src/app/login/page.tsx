"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import classNames from "classnames";

export default function Login() {
  const [user] = useState<Partial<ILoginUser>>({
    email: process.env.NEXT_PUBLIC_EMAIL,
    password: process.env.NEXT_PUBLIC_PASSWORD
  });
  const session = useSession();
  const router = useRouter();
  let [errorMsg, setErrorMsg] = useState("");
  let [visibile, setVisibile] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ mode: "all" });

  const login = async (data: ILoginUser | any) => {
    const { error } = (await signIn(process.env.NEXT_PUBLIC_CREDENTIAL_ID, {
      redirect: false,
      ...data
    })) as SignInResponse;

    if (error) {
      setErrorMsg(error);
    }
  };

  const handlePaste = async (event: any) => {
    event.preventDefault();
    const clipboardData = event.clipboardData.getData("text/plain");
    const formattedValue = clipboardData.replace(/\s/g, "");
    event.target.value = formattedValue;
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            ClixTV Admin
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            {errorMsg && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3"
                role="alert"
              >
                <span className="block sm:inline">{errorMsg}</span>
                <span
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setErrorMsg("")}
                >
                  <svg
                    className="fill-current h-6 w-6 text-red-500"
                    role="button"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <title>Close</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                  </svg>
                </span>
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit(login)}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onPaste={handlePaste}
                    defaultValue={user.email}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[\w]{1,}[\w.+-]{0,}@[\w-]{1,}([.][a-zA-Z]{2,}|[.][\w-]{2,}[.][a-zA-Z]{2,})$/,
                        message: "Invalid email address"
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                      {errors.email?.message?.toString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="relative">
                    <input
                      defaultValue={user.password}
                      id="password"
                      type={visibile ? "text" : "password"}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      {...register("password", {
                        required: "Password is required"
                      })}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                      <svg
                        fill="none"
                        onClick={() => setVisibile(prevState => !prevState)}
                        className={classNames("text-gray-700 w-5 h-5", {
                          block: !visibile,
                          hidden: visibile
                        })}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                      >
                        <path
                          fill="currentColor"
                          d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"
                        ></path>
                      </svg>
                      <svg
                        fill="none"
                        onClick={() => setVisibile(prevState => !prevState)}
                        className={classNames("text-gray-700 w-5 h-5", {
                          block: visibile,
                          hidden: !visibile
                        })}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                      >
                        <path
                          fill="currentColor"
                          d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                      {errors.password?.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <button className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export interface ILoginUser {
  email: string;
  password: string;
}
