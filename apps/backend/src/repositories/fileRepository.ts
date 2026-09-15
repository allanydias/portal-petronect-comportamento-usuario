import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { BehaviorEvent, Session, SupplierProfile, User } from "../types/domain";
import type { Repository } from "./repository";
import { buildSeedData } from "../mock/seed";

type LocalDb = {
  users: User[];
  sessions: Session[];
  events: BehaviorEvent[];
  profiles: SupplierProfile[];
};

export class FileRepository implements Repository {
  private filePath: string;
  private lock: Promise<unknown> = Promise.resolve();

  constructor(filePath = process.env.LOCAL_DB_PATH || ".data/db.json") {
    this.filePath = path.resolve(process.cwd(), filePath);
  }

  private withLock<T>(work: () => Promise<T>): Promise<T> {
    const run = this.lock.then(work, work);
    this.lock = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  async initialize(): Promise<void> {
    return this.withLock(async () => {
      try {
        await fs.access(this.filePath);
      } catch {
        await this.writeUnlocked({
          ...buildSeedData(),
          profiles: []
        });
      }
    });
  }

  private async readUnlocked(): Promise<LocalDb> {
    try {
      await fs.access(this.filePath);
      const raw = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(raw) as LocalDb;
    } catch {
      const db: LocalDb = {
        ...buildSeedData(),
        profiles: []
      };
      await this.writeUnlocked(db);
      return db;
    }
  }

  private async writeUnlocked(db: LocalDb): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const payload = JSON.stringify(db, null, 2);
    const temp = `${this.filePath}.${randomUUID()}.tmp`;
    await fs.writeFile(temp, payload, "utf8");
    try {
      await fs.copyFile(temp, this.filePath);
    } finally {
      await fs.rm(temp, { force: true });
    }
  }

  private async read(): Promise<LocalDb> {
    return this.withLock(() => this.readUnlocked());
  }

  async reset(): Promise<void> {
    return this.withLock(() =>
      this.writeUnlocked({
        ...buildSeedData(),
        profiles: []
      })
    );
  }

  async saveUser(user: User): Promise<User> {
    return this.withLock(async () => {
      const db = await this.readUnlocked();
      const index = db.users.findIndex((item) => item.userId === user.userId);
      if (index >= 0) db.users[index] = user;
      else db.users.push(user);
      await this.writeUnlocked(db);
      return user;
    });
  }

  async getUser(userId: string): Promise<User | null> {
    const db = await this.read();
    return db.users.find((item) => item.userId === userId) ?? null;
  }

  async listUsers(): Promise<User[]> {
    return (await this.read()).users;
  }

  async saveSession(session: Session): Promise<Session> {
    return this.withLock(async () => {
      const db = await this.readUnlocked();
      const index = db.sessions.findIndex((item) => item.sessionId === session.sessionId);
      if (index >= 0) db.sessions[index] = session;
      else db.sessions.push(session);
      await this.writeUnlocked(db);
      return session;
    });
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const db = await this.read();
    return db.sessions.find((item) => item.sessionId === sessionId) ?? null;
  }

  async listSessions(): Promise<Session[]> {
    return (await this.read()).sessions;
  }

  async listSessionsBySupplier(supplierId: string): Promise<Session[]> {
    return (await this.read()).sessions.filter((item) => item.supplierId === supplierId);
  }

  async saveEvent(event: BehaviorEvent): Promise<BehaviorEvent> {
    return this.withLock(async () => {
      const db = await this.readUnlocked();
      if (!db.events.some((item) => item.eventId === event.eventId)) {
        db.events.push(event);
        await this.writeUnlocked(db);
      }
      return event;
    });
  }

  async listEvents(): Promise<BehaviorEvent[]> {
    return (await this.read()).events;
  }

  async listEventsBySupplier(supplierId: string): Promise<BehaviorEvent[]> {
    return (await this.read()).events.filter((item) => item.supplierId === supplierId);
  }

  async listEventsBySession(sessionId: string): Promise<BehaviorEvent[]> {
    return (await this.read()).events.filter((item) => item.sessionId === sessionId);
  }

  async saveProfile(profile: SupplierProfile): Promise<SupplierProfile> {
    return this.withLock(async () => {
      const db = await this.readUnlocked();
      const index = db.profiles.findIndex((item) => item.supplierId === profile.supplierId);
      if (index >= 0) db.profiles[index] = profile;
      else db.profiles.push(profile);
      await this.writeUnlocked(db);
      return profile;
    });
  }

  async getProfile(supplierId: string): Promise<SupplierProfile | null> {
    const db = await this.read();
    return db.profiles.find((item) => item.supplierId === supplierId) ?? null;
  }
}
