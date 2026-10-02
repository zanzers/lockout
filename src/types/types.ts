export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
}

export type GuardDecision = {
    action: "entry" | "deny";
    authorized: boolean;
    personnel: string;
    reasoning: string;
}


export type BackendResult = {
    doorOpened: boolean;
    backendNote: string;
}

export type ChatResponse = {
    reply: string;
    doorOpened: boolean;
    flag?: string;
}