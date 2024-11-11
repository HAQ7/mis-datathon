"use client";

import Image from "next/image";
import elmLogo from "@/assets/elm.png";
import STC from "@/assets/stc.png";
import logo from "@/assets/logo_with_glow.svg";

import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/actions/send-message";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import UserMessage from "@/components/ui/userMessage";
import AiMessage from "@/components/ui/aiMessage";
import Loading from "@/components/ui/loading";
import back from "@/assets/back.svg";
import add from "@/assets/add.svg";
import { Input } from "@/components/ui/input";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
};

type ChatResponse = {
    threadId: string;
    messages: Message[];
    error?: string;
};

export default function Home() {
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const textRef = useRef({} as HTMLTextAreaElement);
    const fileRef = useRef({} as HTMLInputElement);
    const overflowContainerRef = useRef({} as HTMLDivElement);
    const sentMessage = useRef("");
    const [message, setMessage] = useState(null as ChatResponse | null);
    const variants = {
        hidden: { opacity: 0, y: 100 },
        visible: { opacity: 1, y: 0 },
    };
    const sendMessageHandler = async () => {
        if (!textRef.current.value) return;
        if (
            selectedCompany === "other" &&
            fileRef.current &&
            fileRef.current.files &&
            fileRef.current.files[0].size === 0
        )
            return;
        sentMessage.current = textRef.current.value;
        textRef.current.value = "";
        setIsLoading(true);
        let messageObj;
        if (selectedCompany === "other" && fileRef.current) {
            const formData = new FormData();
            if (fileRef.current.files) {
                formData.append("file", fileRef.current.files[0]);
            }
            messageObj = await sendMessage(
                sentMessage.current,
                selectedCompany,
                formData
            );
        } else {
            messageObj = await sendMessage(
                sentMessage.current,
                selectedCompany
            );
        }
        setMessage(messageObj);
        setIsLoading(false);
    };

    useEffect(() => {
        if (overflowContainerRef.current) {
            overflowContainerRef.current.scrollTop =
                overflowContainerRef.current.scrollHeight;
        }
    }, [isLoading]);

    const clearCookies = () => {
        const cookies = document.cookie.split(";");

        // Loop through cookies and expire them
        for (const cookie of cookies) {
            const name = cookie.split("=")[0].trim();
            // Set expiry to a past date to remove the cookie
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    };
    useEffect(() => {
        clearCookies();
    }, []);
    if ((message || isLoading) && selectedCompany) {
        return (
            <div className="h-screen w-[90vw] max-w-[40rem] p-5 flex flex-col justify-between items-center relative">
                <Image
                    onClick={() => {
                        clearCookies();
                        setMessage(null);
                        setSelectedCompany("");
                    }}
                    src={back}
                    alt="back icon"
                    className="w-10 cursor-pointer absolute left-0"
                    priority
                />
                <Image src={logo} alt="logo" className="" priority />
                <div
                    ref={overflowContainerRef}
                    className="overflow-y-auto modern-scroll overflow-x-hidden flex-1 w-full flex flex-col gap-2 my-3"
                >
                    {message?.messages.map(msg => {
                        if (msg.role === "user") {
                            return (
                                <UserMessage key={msg.id}>
                                    {msg.content}
                                </UserMessage>
                            );
                        }
                        return (
                            <AiMessage key={msg.id}>{msg.content}</AiMessage>
                        );
                    })}
                    {isLoading && (
                        <>
                            <UserMessage>{sentMessage.current}</UserMessage>
                            <AiMessage>
                                <Loading />
                            </AiMessage>
                        </>
                    )}
                </div>
                <motion.div
                    key="search"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-[90vw] max-w-[40rem] bg-white rounded-xl shadow-md grid gap-2 p-2 "
                >
                    <Textarea
                        ref={textRef}
                        placeholder={
                            "أسأل عن شركة " +
                            (selectedCompany === "other"
                                ? "المرفقة"
                                : selectedCompany)
                        }
                        className="!outline-none !ring-0 flex-1 px-2 flex items-center h-auto !border-none resize-none shadow-none"
                    />
                    <button
                        disabled={isLoading}
                        onClick={sendMessageHandler}
                        className="px-5 h-8 w-24 bg-black disabled:bg-gray-300 hover:bg-[#21A07B] shadow-xl transition-colors text-white rounded-full"
                    >
                        ارسال
                    </button>
                </motion.div>
            </div>
        );
    }
    return (
        <div className="grid gap-4 place-items-center relative">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                layout
                className="grid place-items-center"
            >
                <Image src={logo} alt="logo" className="" />
            </motion.div>

            {!selectedCompany ? (
                <div>
                    <motion.p
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-[#0B3A3C] text-center px-4"
                    >
                        اختر الشركة التي تريد البحث عنها, او ارفق ملف الشركة
                        التي تريد المعرفه عنها
                    </motion.p>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={variants}
                        transition={{ staggerChildren: 0.1 }}
                        className="flex flex-wrap justify-center gap-10 bg-white shadow-lg p-2 px-5 rounded-xl overflow-hidden mt-5"
                    >
                        <motion.button
                            variants={variants}
                            onClick={() => setSelectedCompany("علم")}
                            whileHover={{ scale: 1.1 }}
                            className=""
                        >
                            <Image
                                src={elmLogo}
                                alt="elm logo"
                                className="w-14"
                            />
                        </motion.button>
                        <motion.button
                            variants={variants}
                            onClick={() => setSelectedCompany("STC")}
                            whileHover={{ scale: 1.1 }}
                            className=""
                        >
                            <Image src={STC} alt="STC" className="w-14" />
                        </motion.button>
                        <motion.button
                            variants={variants}
                            onClick={() => setSelectedCompany("other")}
                            whileHover={{ scale: 1.1 }}
                            className=""
                        >
                            <Image src={add} alt="add icon" className="w-14" />
                        </motion.button>
                    </motion.div>
                </div>
            ) : (
                <>
                    <motion.div
                        key={"back"}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={() => setSelectedCompany("")}
                        className="cursor-pointer absolute left-0 top-0 flex gap-2 hover:bg-[#21A07B] hover:text-white p-2 rounded-full transition-colors"
                    >
                        العودة
                    </motion.div>

                    <motion.div
                        key="search"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-[90vw] max-w-[40rem] bg-white rounded-xl shadow-md grid gap-5 p-2 "
                    >
                        {selectedCompany === "other" && (
                            <Input
                                ref={fileRef}
                                type="file"
                                accept=".pdf"
                                className="max-w-max w-full"
                            />
                        )}
                        <Textarea
                            ref={textRef}
                            placeholder={
                                "أسأل عن شركة " +
                                (selectedCompany === "other"
                                    ? "المرفقة"
                                    : selectedCompany)
                            }
                            className="!outline-none !ring-0 modern-scroll flex-1 px-2 flex items-center h-auto border-none resize-none shadow-none"
                        />
                        <button
                            disabled={isLoading}
                            onClick={sendMessageHandler}
                            className="px-5 h-8 w-min bg-black disabled:bg-gray-700  hover:bg-[#21A07B] shadow-xl transition-colors text-white rounded-full flex items-center justify-center gap-2"
                        >
                            ارسال{" "}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 rotate-180"
                            >
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </motion.div>
                </>
            )}
        </div>
    );
}
