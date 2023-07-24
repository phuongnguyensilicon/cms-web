import { PrismaClient, Title, TitleMetadata } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { id } = await request.json();

  const title: Title | null = await prisma.title.findUnique({
    where: { id }
  });

  if (!title) {
    return new Response("Title not found.", { status: 404 });
  }

  const metadata: TitleMetadata[] = await prisma.titleMetadata.findMany({
    where: { titleId: title.id }
  });

  return new Response(JSON.stringify({ title, metadata }));
}
