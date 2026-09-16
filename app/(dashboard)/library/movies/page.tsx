import { MediaCollection } from "@/components/library/media-collection";
import { getMediaData } from "@/lib/data/media";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const data = await getMediaData(); const version = [...data.items, ...data.quotes].map((item) => `${item.id}-${item.updatedAt.getTime()}`).join("_");
  return <main className="page-shell"><header className="page-header"><div><p className="eyebrow">Stories on screen</p><h1>Movies &amp; Series</h1></div></header>{data.items.length === 0 && <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">No movies or series yet.</p>}<MediaCollection key={version} items={data.items.map((item) => ({ id: item.id, title: item.title, genre: item.genre, category: item.category, country: item.country, recommendedBy: item.recommendedBy, coverAssetId: item.coverAssetId, documentationAssetId: item.documentationAssetId, totalEpisodes: item.totalEpisodes, watchedEpisodes: item.watchedEpisodes, rating: item.rating, thoughts: item.thoughts, startedAt: item.startedAt, completedAt: item.completedAt }))} quotes={data.quotes.map((quote) => ({ id: quote.id, mediaId: quote.mediaId, quote: quote.quote }))} logs={data.logs.map((log) => ({ mediaId: log.mediaId, date: log.date, episodeDelta: log.episodeDelta }))} /></main>;
}
