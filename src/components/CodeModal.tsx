"use client";

import React, { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Copy, Check, Smartphone, Monitor } from "lucide-react";

const SOCKET_URL =
  `${process.env.NEXT_PUBLIC_SOCKET_URL}` || "http://localhost:5000";

export default function CodeModal({ onConnect }: { onConnect: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"get" | "input">("get");

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // init socket once
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // PC: listen mobile connection
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("mobile-connected", () => {
      setConnected(true);
      setIsOpen(false);
      onConnect();
    });

    return () => {
      socketRef.current?.off("mobile-connected");
    };
  }, [onConnect]);

  // =====================
  // PC → Generate Code
  // =====================
  const handleGetCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${SOCKET_URL}/generate-code`);

      if (res.data.success) {
        setGeneratedCode(res.data.code);
        localStorage.setItem("roomId", res.data.roomId);
        if (res.data.name) {
          localStorage.setItem("userName", res.data.name);
        }

        // PC joins room
        socketRef.current?.emit("pc-join", {
          roomId: res.data.roomId,
        });
      }
    } catch {
      console.error("Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // Mobile → Verify Code
  // =====================
  const handleVerifyCode = async () => {
    setLoading(true);
    setVerificationMessage(null);

    try {
      const res = await axios.post(`${SOCKET_URL}/verify-code`, {
        code: inputCode,
      });

      if (res.data.success) {
        localStorage.setItem("roomId", res.data.roomId);
        if (res.data.name) {
          localStorage.setItem("userName", res.data.name);
        }
        setVerificationMessage("Connected successfully");

        // Mobile joins room
        socketRef.current?.emit("mobile-join", {
          roomId: res.data.roomId,
        });

        setConnected(true);
        setIsOpen(false);
        onConnect();
      } else {
        setVerificationMessage("Invalid or expired code");
      }
    } catch {
      setVerificationMessage("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card/90 backdrop-blur-xl border border-white/10 p-6 shadow-2xl shadow-black/50 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus:outline-none"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
              <Monitor className="text-white w-6 h-6" />
            </div>
            <Dialog.Title className="text-xl font-semibold bg-linear-to-br from-white to-white/70 bg-clip-text text-transparent">
              Device Pairing
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground/60 mt-2 max-w-[260px]">
              Generate a code on your PC to connect, or enter a code if you are
              on mobile.
            </Dialog.Description>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-muted/40 rounded-xl mb-6 relative">
            <div
              className={`absolute inset-y-1 w-1/2 bg-background shadow-sm rounded-lg transition-transform duration-300 ease-out ${activeTab === "get" ? "translate-x-0" : "translate-x-full"}`}
            />
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300 ${
                activeTab === "get"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
              onClick={() => setActiveTab("get")}
            >
              Get Code (PC)
            </button>

            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-300 ${
                activeTab === "input"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
              onClick={() => setActiveTab("input")}
            >
              Enter Code (Mobile)
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[180px] flex flex-col justify-center">
            {activeTab === "get" ? (
              <div className="text-center space-y-6">
                {!generatedCode ? (
                  <button
                    onClick={handleGetCode}
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Generate Connection Code</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div
                      className="relative group cursor-pointer"
                      onClick={copyCode}
                    >
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50" />
                      <div className="relative bg-muted/30 border border-white/10 p-6 rounded-2xl flex items-center justify-center gap-4 group-hover:border-primary/50 transition-colors">
                        <span className="text-5xl font-mono font-bold tracking-[0.2em] text-foreground">
                          {generatedCode}
                        </span>
                        {copied ? (
                          <Check className="w-5 h-5 text-emerald-500 absolute right-4" />
                        ) : (
                          <Copy className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary absolute right-4 transition-colors" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm bg-muted/20 py-2 rounded-full border border-white/5 mx-auto max-w-fit px-4">
                      {connected ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-500 font-medium">
                            Device Connected
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-amber-500 font-medium">
                            Waiting for connection...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <input
                      value={inputCode}
                      onChange={(e) =>
                        setInputCode(e.target.value.toUpperCase())
                      }
                      placeholder="ENTER 4-DIGIT CODE"
                      className="w-full bg-muted/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-center tracking-[0.5em] font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/20 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                      maxLength={4}
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={loading || inputCode.length !== 4}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? "Verifying..." : "Connect Device"}
                </button>

                {verificationMessage && (
                  <div
                    className={`text-center text-sm p-3 rounded-lg border ${
                      verificationMessage.includes("success")
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {verificationMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
