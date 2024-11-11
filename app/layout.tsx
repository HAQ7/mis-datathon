import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import leftGlow from "@/assets/lower_left_glow.png";
import rightGlow from "@/assets/upper_right_glow.png";
import deco from '@/assets/deco.png'
import Image from "next/image";

export const metadata: Metadata = {
    title: "بصيرة",
    description: "بصيرة نحو الاستثمار الناجح",
};

const rubik = Rubik({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html dir="rtl">
            <body className={rubik.className}>
                <section className="grid place-items-center min-h-screen overflow-hidden w-screen">
                    <Image
                        src={leftGlow}
                        alt="elm logo"
                        className="absolute bottom-0 left-0 -z-10"
                        priority
                    />
                    <Image
                        src={rightGlow}
                        alt="elm logo"
                        className="absolute top-0 right-0 -z-10"
                        priority
                    />
                    <Image
                        src={deco}
                        alt="elm logo"
                        className="absolute -top-4 right-0 -z-10 w-[500px]"
                        priority
                    />
                    <Image
                        src={deco}
                        alt="elm logo"
                        className="absolute bottom-0 left-0 -z-10 w-[500px]"
                        priority
                    />
                    {children}
                </section>
            </body>
        </html>
    );
}
