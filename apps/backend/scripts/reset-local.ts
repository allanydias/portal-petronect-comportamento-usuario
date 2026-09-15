import { FileRepository } from "../src/repositories/fileRepository";

async function main() {
  const repository = new FileRepository();
  await repository.reset();
  console.log("Banco local recriado com 8 fornecedores fictícios.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
