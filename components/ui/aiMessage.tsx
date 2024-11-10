'use client'
import { motion } from 'framer-motion';

export default function AiMessage({children}: {children: React.ReactNode}) {
    return (
        <motion.div initial={{scale: 0.8, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{type: 'spring', bounce: "0"}} className="w-full flex justify-end">
            <div className="rounded-xl rounded-tl-none bg-[#21A07B] h-max max-w-full text-white p-2">{children}</div>
        </motion.div>
    );
}