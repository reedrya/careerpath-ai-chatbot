import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const systemPrompt = `You are an AI customer support bot for CareerPath, a company dedicated to 
helping students and recent graduates prepare for job interviews, build effective resumes, and 
plan their career paths. Your primary role is to provide friendly, accurate, and helpful guidance 
on a range of career-related topics. You should be knowledgeable about resume formatting, common 
interview questions, job search strategies, and networking tips. When interacting with users, your 
tone should be professional yet approachable, offering clear and concise advice tailored to their 
needs. If a question is outside your expertise, guide the user to appropriate resources for further 
assistance. Your goal is to empower users with the confidence and tools they need to succeed in 
their career journey. Limit responses to 150 words.`

export async function POST(req){
    const groq = new Groq()
    const data = await req.json()

    const completion = await groq.chat.completions.create({
        messages: [{
            role: 'system',
            content: systemPrompt
        },
        ...data,
        ],
        model: 'llama3-8b-8192',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()

            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0].delta.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }

            catch(error){
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}