"use server";
import { ChatMistralAI } from "@langchain/mistralai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

function isArabic(text: string) {
    // Arabic unicode range regex
    const arabicRegex =
        /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
}

export async function sendMessageOpen(
    question: string,
    selectedCompany: string,
    formData?: FormData
) {
    const file = formData?.get("file") as File;
    const API_KEY = process.env.MISTRAL_API_KEY;

    const llm = new ChatMistralAI({
        apiKey: API_KEY,
        model: "open-mixtral-8x22b",
        temperature: 0.5,
    });
    let loader;
    if (selectedCompany === "علم") {
        loader = new PDFLoader("./data/elm.pdf");
    } else if (selectedCompany === "STC") {
        loader = new PDFLoader("./data/stc.pdf");
    } else {
        loader = new PDFLoader(file);
    }

    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const splits = await textSplitter.splitDocuments(docs);
    const vectorStore = await MemoryVectorStore.fromDocuments(
        splits,
        new OpenAIEmbeddings()
    );

    const retriever = vectorStore.asRetriever();
    const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

    const ragChain = await createStuffDocumentsChain({
        llm,
        prompt,
        outputParser: new StringOutputParser(),
    });

    const retrievedDocs = await retriever.invoke(question);

    if (isArabic(question)) {
        question = question + " \n\n\n اجب على السؤال باللغة العربية";
    }

    console.log(question);

    const results = await ragChain.invoke({
        question: question,
        context: retrievedDocs,
    });

    return results;
}
