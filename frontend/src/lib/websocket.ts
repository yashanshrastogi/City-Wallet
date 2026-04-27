export class OfferWebSocket {
  private ws: WebSocket | null = null;

  constructor(
    private taskId: string,
    private onMessage: (data: unknown) => void
  ) {}

  connect() {
    const url = `${process.env.NEXT_PUBLIC_WS_URL}/ws/offers/${this.taskId}/`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      this.onMessage(JSON.parse(event.data));
    };
  }

  disconnect() {
    this.ws?.close();
  }
}
