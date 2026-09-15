import type { BehaviorEvent, Session, SupplierProfile, User } from "../types/domain";

export interface Repository {
  initialize(): Promise<void>;

  saveUser(user: User): Promise<User>;
  getUser(userId: string): Promise<User | null>;
  listUsers(): Promise<User[]>;

  saveSession(session: Session): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  listSessions(): Promise<Session[]>;
  listSessionsBySupplier(supplierId: string): Promise<Session[]>;

  saveEvent(event: BehaviorEvent): Promise<BehaviorEvent>;
  listEvents(): Promise<BehaviorEvent[]>;
  listEventsBySupplier(supplierId: string): Promise<BehaviorEvent[]>;
  listEventsBySession(sessionId: string): Promise<BehaviorEvent[]>;

  saveProfile(profile: SupplierProfile): Promise<SupplierProfile>;
  getProfile(supplierId: string): Promise<SupplierProfile | null>;

  reset?(): Promise<void>;
}
