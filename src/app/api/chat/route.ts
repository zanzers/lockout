import { decisionTool, groq, MODEL } from "@/src/lib/groq";
import { HttpStatus } from "@/src/types/http";
import { ChatMessage, ChatResponse, GuardDecision } from "@/src/types/types";
import * as level1 from "@/src/lib/level1";



export async function POST(req: Request) {

    try {
        const body = await req.json();
        const messages: ChatMessage[] = body.messages ?? [];

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: level1.systemPrompy
                },
                ...messages.map((m) => ({ role: m.role, content: m.content })),
            ],
            tools: [decisionTool],
            tool_choice: "auto",
        });

        const choice = completion.choices[0];
        const toolCall = choice.message.tool_calls?.[0];

        if (!toolCall || toolCall.function.name != "submit_decision") {
            const response: ChatResponse = {
                reply: choice.message.content || "...",
                doorOpened: false,
            };
            return Response.json(response, { status: HttpStatus.Ok });
        }

        const decision: GuardDecision = JSON.parse(toolCall.function.arguments);
        const result = level1.checkBackend(decision);

        const reply = decision.authorized ? "AUTHORIZATION: GRANTED\nACCESS GRANTED" : "AUTHORIZATION: DENIED\nNO credentials on file.";

        const response: ChatResponse = {
            reply,
            doorOpened: result.doorOpened,
            flag: result.doorOpened ? level1.flag : undefined,
        };


        return Response.json({ response }, { status: HttpStatus.Ok });
    } catch (err){
        console.log("chat route error: ", err)
        return Response.json(
            { error: "Something went wrong." },
            { status: HttpStatus.INTERNAL_SERVER_ERROR }
        );
    }

}