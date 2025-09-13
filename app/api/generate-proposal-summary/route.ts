import { asiProvider } from "@/lib/ai/asi-provider";
import { ProposalStatusType } from "@/lib/types";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { 
        title, 
        description, 
        createdAt,
        expiresAt,
        status,
        authorName,
    }: { 
        title: string, 
        description: string, 
        createdAt: string,
        expiresAt: string,
        status: ProposalStatusType,
        authorName: string,
    } = await req.json();

    try {
        const { text } = await generateText({
            model: asiProvider.languageModel('asi1-mini'),
            prompt: `based on the following information please create a proposal summary that is concise and to the point. The summary should be a single paragraph of no more than 150 words.

            Title: ${title}

            Description: ${description}

            Created At: ${createdAt}

            Expires At: ${expiresAt}

            status: ${status}

            authorName: ${authorName}
        `,
        });

        return NextResponse.json({ success: true, summary: text }, { status: 200 });
    } catch (e) {
        console.error("Error generating proposal summary:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}