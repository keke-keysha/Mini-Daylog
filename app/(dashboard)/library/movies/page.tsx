import { MediaCollection } from "@/components/library/media-collection";
import { PageHeading } from "@/components/ui/presentation";
import { getMediaData } from "@/lib/data/media";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const data = await getMediaData(); const version = [...data.items, ...data.quotes].map((item) => `${item.id}-${item.updatedAt.getTime()}`).join("_");
  return <main className="page-shell"><PageHeading eyebrow="Stories on screen" title="Movies &amp; Series" description="Keep the stories you watch and the moments you remember." /><MediaCollection key={version} items={data.items.map((item) => ({ id: item.id, title: item.title, genre: item.genre, category: item.category, country: item.country, recommendedBy: item.recommendedBy, coverAssetId: item.coverAssetId, documentationAssetId: item.documentationAssetId, totalEpisodes: item.totalEpisodes, watchedEpisodes: item.watchedEpisodes, rating: item.rating, thoughts: item.thoughts, startedAt: item.startedAt, completedAt: item.completedAt }))} quotes={data.quotes.map((quote) => ({ id: quote.id, mediaId: quote.mediaId, quote: quote.quote }))} logs={data.logs.map((log) => ({ mediaId: log.mediaId, date: log.date, episodeDelta: log.episodeDelta }))} /></main>;
}
