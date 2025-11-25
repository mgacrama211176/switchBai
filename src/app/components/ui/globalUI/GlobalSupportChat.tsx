"use client";

import { useState } from "react";
import FloatingSupportButton from "./FloatingSupportButton";
import SupportChat from "../chat/SupportChat";

export default function GlobalSupportChat() {
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);

  return (
    <>
      <FloatingSupportButton onClick={() => setIsSupportChatOpen(true)} />
      <SupportChat
        isOpen={isSupportChatOpen}
        onClose={() => setIsSupportChatOpen(false)}
      />
    </>
  );
}
