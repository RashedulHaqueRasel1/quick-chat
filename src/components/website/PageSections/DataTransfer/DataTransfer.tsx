"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Send,
  File as FileIcon,
  MessageSquare,
  Paperclip,
  Download,
  Check,
  Copy,
  Wifi,
  UploadCloud,
  Zap,
} from "lucide-react";

const SOCKET_URL =
  `${process.env.NEXT_PUBLIC_SOCKET_URL}` || "http://localhost:5000";

interface TextMessage {
  type: "text";
  value: string;
  senderId: string;
  timestamp: number;
}

interface FileMessage {
  type: "file";
  name: string;
  mime: string;
  data: string;
  senderId: string;
  timestamp: number;
}

type Message = TextMessage | FileMessage;

export default function DataTransfer() {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [roomId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("roomId");
    }
    return null;
  });

  const [myId] = useState(() => Math.random().toString(36).substring(7));
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<"text" | "files">("text");
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  // init socket
  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current?.emit("pc-join", { roomId });
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("receive-data", (payload: Message) => {
      // Prevent duplicate messages if server broadcasts to everyone including sender
      if (payload.senderId === myId) return;
      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, myId]);

  const sendText = () => {
    if (!text.trim() || !roomId) return;

    const payload: TextMessage = {
      type: "text",
      value: text,
      senderId: myId,
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, payload]);

    socketRef.current?.emit("send-data", {
      roomId,
      payload,
    });

    setText("");
  };

  const sendFile = (file: File) => {
    if (!roomId) return;

    const reader = new FileReader();

    reader.onload = () => {
      const payload: FileMessage = {
        type: "file",
        name: file.name,
        mime: file.type,
        data: reader.result as string,
        senderId: myId,
        timestamp: Date.now(),
      };

      // Optimistic update
      setMessages((prev) => [...prev, payload]);

      socketRef.current?.emit("send-data", {
        roomId,
        payload,
      });
    };

    reader.readAsDataURL(file);
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const textMessages = messages.filter(
    (msg): msg is TextMessage => msg.type === "text"
  );

  const fileMessages = messages.filter(
    (msg): msg is FileMessage => msg.type === "file"
  );

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground bg-background">
        <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Wifi className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <p className="text-xl font-medium">No active session found</p>
        <p className="text-sm mt-2 opacity-60">
          Please regenerate a connection code.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col h-full bg-background/50 backdrop-blur-3xl overflow-hidden rounded-xl border border-border/40 shadow-2xl shadow-black/20 m-0 md:m-4 relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
        {/* Top Navigation Bar */}
        <header className="border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div
                    className={`w-3 h-3 rounded-full ring-2 ring-background transition-colors duration-500 ${
                      isConnected
                        ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        : "bg-rose-500"
                    }`}
                  />
                  {isConnected && (
                    <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
                  )}
                </div>

                <h1 className="font-bold text-xl tracking-tight hidden sm:block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Quick Drop
                </h1>
              </div>

              <div className="h-8 w-px bg-border/40 mx-1 hidden sm:block" />

              {/* Room ID Pill */}
              <div
                onClick={copyRoomId}
                className="flex items-center gap-2.5 bg-muted/30 hover:bg-muted/50 px-4 py-1.5 rounded-full border border-border/30 transition-all cursor-pointer group hover:border-primary/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/70 uppercase font-semibold tracking-wider text-[10px] sm:text-xs">
                    ID
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base tracking-wide text-foreground/90 group-hover:text-primary transition-colors">
                    {roomId.slice(-4)}
                  </span>
                </div>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-muted/20 p-1.5 rounded-xl border border-border/30 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("text")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  activeTab === "text"
                    ? "text-white shadow-lg shadow-indigo-500/10 cursor-pointer"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer"
                }`}
              >
                {activeTab === "text" && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-lg" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <MessageSquare
                    className={`w-4 h-4 ${activeTab === "text" ? "text-primary" : ""}`}
                  />
                  <span className="hidden sm:inline">Messages</span>
                  {textMessages.length > 0 && activeTab !== "text" && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  activeTab === "files"
                    ? "text-white shadow-lg shadow-indigo-500/10 cursor-pointer"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 cursor-pointer"
                }`}
              >
                {activeTab === "files" && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-lg" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <FileIcon
                    className={`w-4 h-4 ${activeTab === "files" ? "text-primary" : ""}`}
                  />
                  <span className="hidden sm:inline">Files</span>
                  {fileMessages.length > 0 && activeTab !== "files" && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative w-full max-w-7xl mx-auto">
          {activeTab === "text" && (
            <div className="flex flex-col h-full w-full">
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-muted/20 scrollbar-track-transparent">
                {textMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
                    <div className="w-24 h-24 bg-gradient-to-br from-muted/30 to-muted/10 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
                      <Zap className="w-10 h-10 text-primary/60" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xl font-medium bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Start the conversation
                      </p>
                      <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
                        Messages sent here are encrypted and delivered
                        instantly.
                      </p>
                    </div>
                  </div>
                ) : (
                  textMessages.map((msg, i) => {
                    const isMe = msg.senderId === myId;
                    return (
                      <div
                        key={i}
                        className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 duration-500`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-6 py-4 text-[15px] leading-relaxed shadow-lg backdrop-blur-sm ${
                            isMe
                              ? "bg-gradient-to-br from-primary to-indigo-600 text-white rounded-2xl rounded-tr-none shadow-indigo-500/10"
                              : "bg-muted/40 border border-white/5 text-foreground/90 rounded-2xl rounded-tl-none"
                          }`}
                        >
                          {msg.value}
                          <div
                            className={`text-[10px] mt-2 font-medium opacity-50 ${isMe ? "text-indigo-200" : "text-slate-400"} text-right`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 md:p-6 border-t border-border/40 bg-background/40 backdrop-blur-md">
                <div className="relative flex items-center max-w-4xl mx-auto gap-3">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type a message..."
                      className="relative w-full bg-muted/30 hover:bg-muted/50 focus:bg-background border border-border/40 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all text-base shadow-inner placeholder:text-muted-foreground/40"
                      onKeyDown={(e) => e.key === "Enter" && sendText()}
                      autoFocus
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        onClick={sendText}
                        disabled={!text.trim()}
                        className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 hover:scale-105 disabled:opacity-0 disabled:scale-75 transition-all duration-300 shadow-lg shadow-indigo-500/20"
                      >
                        <Send className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="h-full overflow-y-auto p-4 md:p-8 w-full scrollbar-thin scrollbar-thumb-muted/20 scrollbar-track-transparent">
              <div className="space-y-10 pb-10 max-w-6xl mx-auto">
                {/* Upload Area */}
                <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-3xl p-10 md:p-16 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 group cursor-pointer overflow-hidden isolate">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) =>
                      e.target.files && sendFile(e.target.files[0])
                    }
                  />

                  <div className="flex flex-col items-center justify-center text-center space-y-6 relative z-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="w-20 h-20 bg-muted/40 border border-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                        <UploadCloud className="w-10 h-10 text-primary group-hover:text-primary/100 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-2xl tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                        Drop files to share
                      </h3>
                      <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
                        Any file format up to 50MB. Instant P2P transfer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Paperclip className="w-4 h-4 text-primary" />
                      </div>
                      Shared Files
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground/60 bg-muted/30 border border-white/5 px-2.5 py-1 rounded-full">
                      {fileMessages.length} items
                    </span>
                  </div>

                  {fileMessages.length === 0 ? (
                    <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/40">
                      <p className="text-muted-foreground/60">
                        No files shared yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {fileMessages.map((msg, i) => (
                        <div
                          key={i}
                          className="group relative bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 hover:border-primary/20 transition-all duration-300 animate-in fade-in zoom-in-95"
                        >
                          <div className="aspect-square bg-muted/20 relative overflow-hidden flex items-center justify-center group-hover:bg-muted/30 transition-colors">
                            {msg.mime.startsWith("image") ? (
                              <Image
                                src={msg.data}
                                alt={msg.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <FileIcon className="w-12 h-12 text-muted-foreground/30 group-hover:text-primary/60 transition-colors duration-300" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                              <a
                                href={msg.data}
                                download={msg.name}
                                className="p-3.5 bg-white text-black rounded-full hover:scale-110 hover:bg-primary hover:text-white transition-all duration-300 shadow-xl"
                                title="Download"
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            </div>
                          </div>

                          <div className="p-4 bg-card/60 border-t border-white/5 backdrop-blur-md">
                            <p
                              className="font-medium text-sm truncate text-foreground/90 group-hover:text-primary transition-colors"
                              title={msg.name}
                            >
                              {msg.name}
                            </p>
                            <div className="flex items-center justify-between mt-2.5 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                              <span className="bg-muted/50 px-1.5 py-0.5 rounded text-xs normal-case tracking-normal">
                                {(msg.data.length / 1024).toFixed(1)} KB
                              </span>
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="text-center text-xs text-muted-foreground/40 py-2">
        <span className="opacity-0 animate-in fade-in delay-1000 duration-1000">
          Encrypted P2P Connection
        </span>
      </div>
    </div>
  );
}
