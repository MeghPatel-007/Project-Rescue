import { db } from "@/db";
import { usersTable } from "@/db/schema/user.schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    
    const users = await db.select().from(usersTable);

    return NextResponse.json
    (
        {users: users, message: "Users fetched successfully"}, 
    {status: 200})
    ;
}