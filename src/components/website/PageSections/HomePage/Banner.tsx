"use client";

import { useState } from "react";
import CodeModal from "@/components/CodeModal";
import DataTransfer from "../DataTransfer/DataTransfer";

export default function Banner() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <section className="relative lg:grid lg:h-screen lg:place-content-center">
      {!isConnected && <CodeModal onConnect={() => setIsConnected(true)} />}

      {isConnected && <DataTransfer />}
    </section>
  );
}
