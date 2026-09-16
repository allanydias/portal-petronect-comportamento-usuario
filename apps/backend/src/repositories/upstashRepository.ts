import { Redis } from "@upstash/redis";
import type { BehaviorEvent, Session, SupplierProfile, User } from "../types/domain";
import type { Repository } from "./repository";
import { buildSeedData } from "../mock/seed";

type LocalDb = {
  users: User[];
  sessions: Session[];
  events: BehaviorEvent[];
  profiles: SupplierProfile[];
};

const DB_KEY = "petronect:db";

export class UpstashRepository implements Repository {
  private redis = Redis.fromEnv();

  private async read(): Promise<LocalDb> {
    const db = await this.redis.get<LocalDb>(DB_KEY);
    if (db) return db;
    const seeded: LocalDb = { ...buildSeedData(), profiles: [] };
    await this.redis.set(DB_KEY, seeded);
    return seeded;
  }

  private async write(db: LocalDb): Promise<void> {
    await this.redis.set(DB_KEY, db);
  }

  async initialize(): Promise<void> {
    await this.read();
  }

  async reset(): Promise<void> {
    await this.write({ ...buildSeedData(), profiles: [] });
  }

  async saveUser(user: User): Promise<User> {
    const db = await this.read();
    const i = db.users.findIndex((u) => u.userId === user.userId);
    if (i >= 0) db.users[i] = user; else db.users.push(user);
    await this.write(db);
    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    return (await this.read()).users.find((u) => u.userId === userId) ?? null;
  }

  async listUsers(): Promise<User[]> {
    return (await this.read()).users;
  }

  async saveSession(session: Session): Promise<Session> {
    const db = await this.read();
    const i = db.sessions.findIndex((s) => s.sessionId === session.sessionId);
    if (i >= 0) db.sessions[i] = session; else db.sessions.push(session);
    await this.write(db);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return (await this.read()).sessions.find((s) => s.sessionId === sessionId) ?? null;
  }

  async listSessions(): Promise<Session[]> {
    return (await this.read()).sessions;
  }

  async listSessionsBySupplier(supplierId: string): Promise<Session[]> {
    return (await this.read()).sessions.filter((s) => s.supplierId === supplierId);
  }

  async saveEvent(event: BehaviorEvent): Promise<BehaviorEvent> {
    const db = await this.read();
    if (!db.events.some((e) => e.eventId === event.eventId)) {
      db.events.push(event);
      await this.write(db);
    }
    return event;
  }

  async listEvents(): Promise<BehaviorEvent[]> {
    return (await this.read()).events;
  }

  async listEventsBySupplier(supplierId: string): Promise<BehaviorEvent[]> {
    return (await this.read()).events.filter((e) => e.supplierId === supplierId);
  }

  async listEventsBySession(sessionId: string): Promise<BehaviorEvent[]> {
    return (await this.read()).events.filter((e) => e.sessionId === sessionId);
  }

  async saveProfile(profile: SupplierProfile): Promise<SupplierProfile> {
    const db = await this.read();
    const i = db.profiles.findIndex((p) => p.supplierId === profile.supplierId);
    if (i >= 0) db.profiles[i] = profile; else db.profiles.push(profile);
    await this.write(db);
    return profile;
  }

  async getProfile(supplierId: string): Promise<SupplierProfile | null> {
    return (await this.read()).profiles.find((p) => p.supplierId === supplierId) ?? null;
  }
}