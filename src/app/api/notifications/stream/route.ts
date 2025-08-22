import { notificationEmitter } from '@/lib/notificationEmitter'

export const dynamic = 'force-dynamic'

export async function GET() {
  let onNotification: any
  const stream = new ReadableStream({
    start(controller) {
      onNotification = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
      }
      notificationEmitter.on('notification', onNotification)
      controller.enqueue(': connected\n\n')
    },
    cancel() {
      notificationEmitter.off('notification', onNotification)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
}
