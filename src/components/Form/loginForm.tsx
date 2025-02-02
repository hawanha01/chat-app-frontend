"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { FormEvent, SetStateAction, useEffect, useState } from "react";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";
import pusherClient from "@/lib/pusher";

const loginStateInitial: { email: string } = {
  email: "",
};

const LoginForm = () => {
  const router = useRouter();
  const [login, setLogin] = useState<{ email: string }>(loginStateInitial);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState(
    pusherClient.connection.state
  );

  useEffect(() => {
    const handleStateChange = (states: { current: SetStateAction<string> }) => {
      setConnectionState(states.current);
      if (states.current === "disconnected") {
        console.warn("Reconnecting Pusher...");
        pusherClient.connect();
      }
    };

    pusherClient.connection.bind("state_change", handleStateChange);
    return () => {
      pusherClient.connection.unbind("state_change", handleStateChange);
    };
  }, [connectionState]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/login`,
        {
          params: { email: login.email },
        }
      );
      localStorage.setItem("currentUserId", userResponse.data.data.id);
      const channel = pusherClient.subscribe(
        `presence-${localStorage.getItem("currentUserId")}`
      );

      channel.bind("pusher:subscription_error", (status: any) => {
      console.log("Subscription error:", status);
    });

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Subscription successful!");
    });

      router.push("/chat");
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="ml-0 max-w-full p-[15px] pt-[30px] lg:ml-[100px] lg:max-w-[588px] lg:px-0 lg:pb-[50px] lg:pt-[65px] bg-[#EBE9E1]"
    >
      <h1 className="mb-4 text-[26px] font-bold md:text-4xl">Log In</h1>
      <div className="mb-[24px] rounded-xl bg-white p-[15px] lg:px-[35px] lg:py-[30px]">
        <h1 className="mb-7 text-[20px] font-bold">
          Log in using your email address
        </h1>
        <div className="mb-4">
          <Input
            renderErrors={true}
            errorKeys={["email"]}
            disabled={loading}
            className="mb-[15px] h-[57px]"
            label="Email"
            type="email"
            name="email"
            value={login.email}
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
          />
        </div>
        <Link
          href="/forgot-password"
          className={`ml-auto block w-fit text-right text-red-200	 ${
            loading ? "pointer-events-none cursor-not-allowed opacity-50" : ""
          }`}
        >
          Forgot your password?
        </Link>
      </div>
      <Button
        isLoading={loading}
        loaderSize="!size-6"
        variant="filled"
        buttonColor="black"
        size="large"
        className="mb-4"
      >
        Continue
      </Button>
      <p>
        Need to create an account?
        <Link
          href="/signup"
          className={`ml-[5px] text-red-200 ${
            loading ? "pointer-events-none cursor-not-allowed opacity-50" : ""
          }`}
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
