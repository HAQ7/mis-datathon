'use server';

import OpenAI from 'openai';
const GPTApi = process.env.OPENAI_API_KEY;

export default async function getMessage() {
  const openai = new OpenAI({apiKey: GPTApi});

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      {
        role: 'user',
        content: 'Write a haiku about recursion in programming.',
      },
    ],
  });

  console.log(completion.choices[0].message);
}

// import Groq from "groq-sdk";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export async function main({message}: {message:string}) {
//   const chatCompletion = await getGroqChatCompletion(message);
//   // Print the completion returned by the LLM.
//   console.log(chatCompletion.choices[0]?.message?.content || "");
// }

// export async function getGroqChatCompletion(message: string) {
//   return groq.chat.completions.create({
//     messages: [
//       {
//         role: "user",
//         content: message,
//       },
//     ],
//     model: "llama3-8b-8192",
//   });
// }
