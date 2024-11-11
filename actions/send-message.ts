"use server";

import OpenAI from "openai";
import { cookies } from "next/headers";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

async function createInitialThread(): Promise<{ threadId: string }> {
    // Create new thread
    const thread = await openai.beta.threads.create();

    // Store thread ID in cookie (14 day expiry)
    cookies().set("threadId", thread.id, {
        expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production",
    });

    return { threadId: thread.id };
}

async function getThreadMessages(threadId: string): Promise<Message[]> {
    const messages = await openai.beta.threads.messages.list(threadId);

    return messages.data
        .map(msg => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content[0].type === 'text' ? msg.content[0].text.value : '',
            createdAt: new Date(msg.created_at * 1000).getTime(),
        }))
        .sort((a, b) => a.createdAt - b.createdAt);
}

async function waitForResponse(threadId: string, runId: string): Promise<void> {
    let run;
    do {
        run = await openai.beta.threads.runs.retrieve(threadId, runId);
        if (run.status === "failed") {
            throw new Error("Assistant run failed: " + run.last_error?.message);
        }
        if (run.status !== "completed") {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } while (run.status !== "completed");
}

export async function sendMessage(
    message: string,
    company: string,
    formData?: FormData
): Promise<ChatResponse> {
    try {
        const file = formData?.get("file") as File;
        let threadId = cookies().get("threadId")?.value;
        let assistantId;
        if (company === "other") {
            assistantId = cookies().get("assistantId")?.value;
            if (!assistantId) {
                assistantId = await createAssistantWithFile({
                    file: file,
                }).then(res => res.assistantId);
            }
        } else {
            assistantId =
                company === "علم"
                    ? "asst_hGJVpXl1i8GvLspa2hpruyqx"
                    : "asst_QLp8NJoVMHZVczp1cBcfQnhf";
        }

        // If no thread exists, create one
        if (!threadId) {
            const initial = await createInitialThread();
            threadId = initial.threadId;
        }

        // Verify thread still exists
        try {
            await openai.beta.threads.retrieve(threadId);
        } catch (error) {
            // Thread doesn't exist, create new one
            const initial = await createInitialThread();
            threadId = initial.threadId;
        }

        // Add user message to thread
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message,
        });

        // Run assistant
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
        });

        // Wait for the assistant's response
        await waitForResponse(threadId, run.id);

        // Get updated messages
        const messages = await getThreadMessages(threadId);

        return { threadId, messages };
    } catch (error) {
        if (error instanceof Error) {
            return {
                threadId: "",
                messages: [],
                error: error.message,
            };
        }
        throw error;
    }
}

type CreateAssistantWithFileParams = {
    file: File;
    name?: string;
    instructions?: string;
    description?: string;
};

export async function createAssistantWithFile({
    file,
}: CreateAssistantWithFileParams): Promise<{
    assistantId: string;
    fileId: string;
}> {
    try {
        // Verify file type
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/markdown",
            "application/json",
            "text/csv",
        ];

        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                "Invalid file type. Allowed types are: PDF, DOCX, TXT, MD, JSON, and CSV"
            );
        }

        // Create a file object in OpenAI
        const uploadedFile = await openai.files.create({
            file: file,
            purpose: "assistants",
            
        });

        // Create an assistant with the file
        const assistant = await openai.beta.assistants.create({
            name: "Financial Analyst Assistant",
            instructions:
                "You are an expert financial analyst. Use you knowledge base to answer questions about audited financial statements. - you can  use the provided file for insight. - if asked about other companies you just mention the average company in that particular field. - you can run code to answer questions that need calculations.",
            model: "gpt-4o-mini",
            tools: [{ type: "file_search" }, { type: "code_interpreter" }],
        });

        const vectorStore = await openai.beta.vectorStores.create({
            name: "Financial Statement",
            file_ids: [uploadedFile.id],
            expires_after: {days: 1, anchor: "last_active_at"}
        });

        await openai.beta.assistants.update(assistant.id, {
            tool_resources: {
                file_search: { vector_store_ids: [vectorStore.id] },
            },
        });

        // Store assistant and file IDs in cookies (30 day expiry)
        const cookieStore = cookies();
        cookieStore.set("assistantId", assistant.id, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        cookieStore.set("fileId", uploadedFile.id, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        return {
            assistantId: assistant.id,
            fileId: uploadedFile.id,
        };
    } catch (error) {
        console.error("Error creating assistant with file:", error);
        throw error;
    }
}

// Helper function to delete assistant and associated file
// export async function deleteAssistantAndFile(): Promise<void> {
//     try {
//         const cookieStore = cookies();
//         const assistantId = cookieStore.get("assistantId")?.value;
//         const fileId = cookieStore.get("fileId")?.value;

//         if (!assistantId || !fileId) {
//             throw new Error("No assistant or file found");
//         }

//         // Delete file
//         await openai.files.del(fileId);

//         // Delete assistant
//         await openai.beta.assistants.delete(assistantId);

//         // Remove cookies
//         cookieStore.delete("assistantId");
//         cookieStore.delete("fileId");
//     } catch (error) {
//         console.error("Error deleting assistant and file:", error);
//         throw error;
//     }
// }
