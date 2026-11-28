"use client";

// Authors: Tyler Siedner and Tyler Harris

import Image from "next/image";
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
    <div className="splash-screen">
      {visible && (
        <Image
          src="/images/facehugger.png"
          width={1122}
          height={1402}
          unoptimized
          alt="Facehugger"
          className="splash-image"
        />
      )}
    </div>
  );
}
