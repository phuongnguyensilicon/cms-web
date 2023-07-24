import { createWriterConnection } from "@/utils/mysqlUtil";
import { PrismaClient, Title, TitleMetadata } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { name, tmdbId, providerId, metadata } = await request.json();

  const createdTitle: Title = await prisma.title.create({
    data: {
      name,
      tmdbId,
      providerId,
      synopsis: ""
    }
  });

  const metadataPromises = metadata.map(
    async (meta: { key: string; value: string }) => {
      const createdMetadata: TitleMetadata = await prisma.titleMetadata.create({
        data: {
          titleId: createdTitle.id,
          metaKey: meta.key,
          metaValue: meta.value
        }
      });

      return createdMetadata;
    }
  );

  const createdMetadata = await Promise.all(metadataPromises);

  return new Response(JSON.stringify({ createdTitle, createdMetadata }));
}
