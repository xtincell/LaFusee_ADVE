"use client";
import { trpc } from "@/lib/trpc/client";
export default function FuseeCampaignsPage() {
  const { data: campaigns } = trpc.campaign.list.useQuery({});
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campagnes (toutes)</h1>
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">+ Nouvelle campagne</button>
      <p className="text-muted-foreground">{(campaigns ?? []).length} campagnes</p>
    </div>
  );
}
