import type { Repository } from "./repository";
import { FileRepository } from "./fileRepository";
import { DynamoRepository } from "./dynamoRepository";

let instance: Repository | null = null;

export function getRepository(): Repository {
  if (!instance) {
    instance =
      process.env.DATA_MODE === "dynamo"
        ? new DynamoRepository()
        : new FileRepository();
  }
  return instance;
}
