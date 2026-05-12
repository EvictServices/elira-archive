import { NextRequest } from 'next/server'
import { handleScriptMessagePatch, handleScriptMessageDelete } from '@/lib/settings/script_message_route'

export function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return handleScriptMessagePatch('goodbye', req, ctx)
}

export function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return handleScriptMessageDelete('goodbye', req, ctx)
}
