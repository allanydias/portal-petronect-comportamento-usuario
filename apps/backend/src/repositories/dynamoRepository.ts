import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";
import type { BehaviorEvent, Session, SupplierProfile, User } from "../types/domain";
import type { Repository } from "./repository";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" }),
  { marshallOptions: { removeUndefinedValues: true } }
);

function table(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ${name} não configurada.`);
  return value;
}

async function scanAll<T>(tableName: string): Promise<T[]> {
  const items: T[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const result = await client.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey }));
    items.push(...((result.Items ?? []) as T[]));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
}

export class DynamoRepository implements Repository {
  async initialize(): Promise<void> {
    // Infraestrutura é criada pelo CloudFormation/serverless.yml.
  }

  async saveUser(user: User): Promise<User> {
    await client.send(new PutCommand({ TableName: table("USERS_TABLE"), Item: user }));
    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    const result = await client.send(
      new GetCommand({ TableName: table("USERS_TABLE"), Key: { userId } })
    );
    return (result.Item as User | undefined) ?? null;
  }

  async listUsers(): Promise<User[]> {
    return scanAll<User>(table("USERS_TABLE"));
  }

  async saveSession(session: Session): Promise<Session> {
    await client.send(new PutCommand({ TableName: table("SESSIONS_TABLE"), Item: session }));
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const result = await client.send(
      new GetCommand({ TableName: table("SESSIONS_TABLE"), Key: { sessionId } })
    );
    return (result.Item as Session | undefined) ?? null;
  }

  async listSessions(): Promise<Session[]> {
    return scanAll<Session>(table("SESSIONS_TABLE"));
  }

  async listSessionsBySupplier(supplierId: string): Promise<Session[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: table("SESSIONS_TABLE"),
        IndexName: "SupplierStartedAtIndex",
        KeyConditionExpression: "supplierId = :supplierId",
        ExpressionAttributeValues: { ":supplierId": supplierId },
        ScanIndexForward: false
      })
    );
    return (result.Items ?? []) as Session[];
  }

  async saveEvent(event: BehaviorEvent): Promise<BehaviorEvent> {
    await client.send(new PutCommand({ TableName: table("EVENTS_TABLE"), Item: event }));
    return event;
  }

  async listEvents(): Promise<BehaviorEvent[]> {
    return scanAll<BehaviorEvent>(table("EVENTS_TABLE"));
  }

  async listEventsBySupplier(supplierId: string): Promise<BehaviorEvent[]> {
    const result = await client.send(
      new QueryCommand({
        TableName: table("EVENTS_TABLE"),
        IndexName: "SupplierTimestampIndex",
        KeyConditionExpression: "supplierId = :supplierId",
        ExpressionAttributeValues: { ":supplierId": supplierId },
        ScanIndexForward: false
      })
    );
    return (result.Items ?? []) as BehaviorEvent[];
  }

  async listEventsBySession(sessionId: string): Promise<BehaviorEvent[]> {
    const all = await this.listEvents();
    return all.filter((item) => item.sessionId === sessionId);
  }

  async saveProfile(profile: SupplierProfile): Promise<SupplierProfile> {
    await client.send(
      new PutCommand({ TableName: table("SUPPLIER_PROFILES_TABLE"), Item: profile })
    );
    return profile;
  }

  async getProfile(supplierId: string): Promise<SupplierProfile | null> {
    const result = await client.send(
      new GetCommand({
        TableName: table("SUPPLIER_PROFILES_TABLE"),
        Key: { supplierId }
      })
    );
    return (result.Item as SupplierProfile | undefined) ?? null;
  }
}
