"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const flicker = setInterval(() => {
      setVisible((previous) => !previous);
    }, 40);

    const redirect = setTimeout(() => {
      clearInterval(flicker);
      router.replace("/home");
    }, 400);

    return () => {
      clearInterval(flicker);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      {visible && (
        <img
          src="/images/facehugger.png"
          alt="Facehugger"
          className="h-screen w-screen object-contain"
        />
      )}
    </div>
  );
}
