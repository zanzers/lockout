import { HttpStatus } from "@/src/lib/http";



export async function POST(req: Request){

    try{
        return Response.json({ok: true}, { status: HttpStatus.Ok});
    } catch {
        return Response.json(
            { error: "Something went wrong."},
            { status: HttpStatus.INTERNAL_SERVER_ERROR}
        );
    }

}