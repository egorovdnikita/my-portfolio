// Присутствие на сайте: каждый посетитель держит WebSocket-подключение к одной комнате.
// Комната рассылает всем список посетителей (id и случайное имя). Ничего не сохраняется на диск.
import { DurableObject } from 'cloudflare:workers';

interface Env {
  ROOM: DurableObjectNamespace<PresenceRoom>;
  ALLOWED_ORIGINS: string;
}

type Visitor = { id: string; name: string };

const ID_RE = /^[a-zA-Z0-9-]{8,64}$/;
const MAX_NAME = 48;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/ws') return new Response('portfolio presence', { status: 200 });

    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    if (!allowed.includes(origin)) return new Response('forbidden origin', { status: 403 });
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });

    const id = url.searchParams.get('id') ?? '';
    const name = (url.searchParams.get('name') ?? '').slice(0, MAX_NAME);
    if (!ID_RE.test(id) || !name) return new Response('bad visitor', { status: 400 });

    const room = env.ROOM.get(env.ROOM.idFromName('portfolio'));
    return room.fetch(request);
  },
};

export class PresenceRoom extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const visitor: Visitor = {
      id: url.searchParams.get('id')!,
      name: url.searchParams.get('name')!.slice(0, MAX_NAME),
    };

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    // Hibernation API: объект может «уснуть», подключения при этом не рвутся
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(visitor);
    this.broadcast();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Клиент шлёт ping, чтобы прокси не закрывали соединение
    if (message === 'ping') ws.send('pong');
  }

  async webSocketClose(ws: WebSocket) {
    ws.close();
    this.broadcast();
  }

  async webSocketError() {
    this.broadcast();
  }

  private broadcast() {
    const sockets = this.ctx.getWebSockets();
    // Несколько вкладок одного посетителя — один человек
    const visitors = new Map<string, Visitor>();
    for (const ws of sockets) {
      if (ws.readyState !== WebSocket.OPEN) continue;
      const v = ws.deserializeAttachment() as Visitor | null;
      if (v) visitors.set(v.id, v);
    }
    const payload = JSON.stringify({ type: 'presence', visitors: [...visitors.values()] });
    for (const ws of sockets) {
      try {
        ws.send(payload);
      } catch {
        // сокет уже закрыт
      }
    }
  }
}
