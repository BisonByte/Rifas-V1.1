import { EventEmitter } from 'events'

export interface NotificationEvent {
  id: string
  tipo: string
  titulo: string
  mensaje: string
}

export const notificationEmitter = new EventEmitter()

export function emitNotification(notification: NotificationEvent) {
  notificationEmitter.emit('notification', notification)
}
