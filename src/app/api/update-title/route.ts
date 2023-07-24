// src/app/api/update-title

import { PrismaClient, Title, TitleMetadata } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  const { id, providerId, tmdbId, name, metadata } = await request.json();

  const updatedTitle: Title = await prisma.title.update({
    where: { id },
    data: {
      providerId,
      tmdbId,
      name
    }
  });

  if (metadata) {
    await prisma.titleMetadata.deleteMany({
      where: {
        titleId: updatedTitle.id
      }
    });

    const metadataPromises = metadata.map(
      async (meta: { key: string; value: string }) => {
        const updatedMetadata: TitleMetadata =
          await prisma.titleMetadata.create({
            data: {
              titleId: updatedTitle.id,
              metaKey: meta.key,
              metaValue: meta.value
            }
          });

        return updatedMetadata;
      }
    );

    const updatedMetadata = await Promise.all(metadataPromises);
    return new Response(JSON.stringify({ updatedTitle, updatedMetadata }));
  }

  return new Response(JSON.stringify({ updatedTitle }));
}
