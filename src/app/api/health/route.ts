import { NextResponse } from 'next/server';
import { performHealthCheck, repairHealthIssue } from '@/lib/engine';

export async function GET() {
  try {
    const issues = await performHealthCheck();
    return NextResponse.json(issues);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const issue = await req.json();
    const result = await repairHealthIssue(issue);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
