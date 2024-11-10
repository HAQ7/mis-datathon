'use client'
import { motion } from 'framer-motion';


export default function UserMessage({children}: {children: React.ReactNode}) {
    return (
        <motion.div initial={{scale: 0.8, opacity: 0}} animate={{scale: 1, opacity: 1}} className="w-full">
            <div className="rounded-xl rounded-tr-none bg-[#5BC862] w-max max-w-full p-2 text-white">{children}</div>
        </motion.div>
    );
}