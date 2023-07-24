import { createWriterConnection } from "@/utils/mysqlUtil";

export async function POST(request: Request) {
  const { name } = await request.json();

  const mysqlConnection = await createWriterConnection();

  const query = "INSERT INTO test (column1, column2) VALUES (?, ?)";
  const result = await mysqlConnection.execute(query, [name, "test"]);

  return new Response("Hello, Next.js!");
}
