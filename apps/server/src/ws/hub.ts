import type {
  NavigationSnapshot,
  ServerMessage,
} from "@dotslide/protocol";

type ConnectionInfo = {
  userId: string | null;
  presentation: string;
  role?: string;
};

export type Question = {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  upvotes: number;
  upvotedBy: Set<string>;
  dismissed: boolean;
};

type SlideMetadata = {
  index: number;
  title?: string;
  hasThumbnail: boolean;
};

export type WSConnection = {
  send(data: string): void;
};

class Hub {
  private connections = new Map<WSConnection, ConnectionInfo>();
  private state: NavigationSnapshot = {
    navigationIndex: 0,
    activeSlide: 0,
    activeStep: 1,
    numSlides: 0,
  };
  private thumbnails = new Map<number, Buffer>();
  private questions = new Map<string, Question>();
  private slideMetadata: SlideMetadata[] = [];

  // ── Connection management ──

  addConnection(ws: WSConnection, info: ConnectionInfo) {
    this.connections.set(ws, info);
  }

  removeConnection(ws: WSConnection) {
    this.connections.delete(ws);
  }

  getRole(ws: WSConnection): string | undefined {
    return this.connections.get(ws)?.role;
  }

  // ── Navigation state ──

  updateState(partial: Partial<NavigationSnapshot>) {
    Object.assign(this.state, partial);
  }

  getState(): NavigationSnapshot {
    return { ...this.state };
  }

  /** Send full state sync to a specific connection */
  sendSync(ws: WSConnection) {
    ws.send(
      JSON.stringify({
        type: "sync",
        ...this.state,
      }),
    );
  }

  // ── Broadcasting ──

  /** Broadcast a message to all connections */
  broadcast(message: ServerMessage) {
    const data = JSON.stringify(message);
    for (const ws of this.connections.keys()) {
      ws.send(data);
    }
  }

  /** Broadcast to all connections except the sender */
  broadcastExcept(sender: WSConnection, message: ServerMessage) {
    const data = JSON.stringify(message);
    for (const ws of this.connections.keys()) {
      if (ws !== sender) ws.send(data);
    }
  }

  /** Broadcast to connections with a specific role */
  broadcastToRole(role: string, message: ServerMessage) {
    const data = JSON.stringify(message);
    for (const [ws, info] of this.connections.entries()) {
      if (info.role === role) ws.send(data);
    }
  }

  // ── Thumbnail management ──

  setThumbnail(slideIndex: number, data: Buffer) {
    this.thumbnails.set(slideIndex, data);
    // Update metadata
    const meta = this.slideMetadata.find((m) => m.index === slideIndex);
    if (meta) {
      meta.hasThumbnail = true;
    }
  }

  getThumbnail(slideIndex: number): Buffer | undefined {
    return this.thumbnails.get(slideIndex);
  }

  // ── Slide metadata ──

  setSlideMetadata(metadata: SlideMetadata[]) {
    this.slideMetadata = metadata;
    this.state.numSlides = metadata.length;
  }

  getSlideMetadata(): SlideMetadata[] {
    return this.slideMetadata.map((m) => ({
      ...m,
      hasThumbnail: this.thumbnails.has(m.index),
    }));
  }

  // ── Question management ──

  addQuestion(text: string, author: string): Question {
    const id = crypto.randomUUID();
    const question: Question = {
      id,
      text,
      author,
      timestamp: Date.now(),
      upvotes: 0,
      upvotedBy: new Set(),
      dismissed: false,
    };
    this.questions.set(id, question);

    // Broadcast to all connections
    this.broadcast({
      type: "question",
      id: question.id,
      text: question.text,
      author: question.author,
      timestamp: question.timestamp,
      upvotes: question.upvotes,
    });

    return question;
  }

  upvoteQuestion(
    id: string,
    userId: string,
  ): { id: string; upvotes: number } | null {
    const question = this.questions.get(id);
    if (!question) return null;

    // Prevent double-voting
    if (question.upvotedBy.has(userId)) {
      return { id: question.id, upvotes: question.upvotes };
    }

    question.upvotedBy.add(userId);
    question.upvotes++;

    // Broadcast update
    this.broadcast({
      type: "question:upvote",
      id: question.id,
      upvotes: question.upvotes,
    });

    return { id: question.id, upvotes: question.upvotes };
  }

  getQuestions(): Omit<Question, "upvotedBy">[] {
    return Array.from(this.questions.values())
      .filter((q) => !q.dismissed)
      .sort((a, b) => b.upvotes - a.upvotes)
      .map(({ upvotedBy: _, ...q }) => q);
  }
}

export const hub = new Hub();
