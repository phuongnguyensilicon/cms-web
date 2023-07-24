// db.ts
import { Connection, createConnection } from "mysql2/promise";

const MYSQL_WRITER = process.env.MYSQL_WRITER;
const MYSQL_READER = process.env.MYSQL_READER;
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USERNAME = process.env.MYSQL_USERNAME;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;

export async function createWriterConnection(): Promise<Connection> {
  try {
    return await createConnection({
      host: MYSQL_WRITER,
      port: parseInt(MYSQL_PORT as string),
      user: MYSQL_USERNAME,
      password: MYSQL_PASSWORD,
    });
  } catch (error) {
    console.error("Error connecting to the MySQL database:", error);
    throw error;
  }
}

export async function createReaderConnection(): Promise<Connection> {
  try {
    return await createConnection({
      host: MYSQL_READER,
      port: parseInt(MYSQL_PORT as string),
      user: MYSQL_USERNAME,
      password: MYSQL_PASSWORD,
    });
  } catch (error) {
    console.error("Error connecting to the MySQL database:", error);
    throw error;
  }
}
