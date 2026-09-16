import type { Repository } from "./repository";
import { FileRepository } from "./fileRepository";
import { DynamoRepository } from "./dynamoRepository";
import { UpstashRepository } from "./upstashRepository";

let instance: Repository | null = null;

export function getRepository(): Repository {
  if (!instance) {
    if (process.env.DATA_MODE === "dynamo") {
      instance = new DynamoRepository();
    } else if (process.env.DATA_MODE === "upstash") {
      instance = new UpstashRepository();
    } else {
      instance = new FileRepository();
    }
  }
  return instance;
}
