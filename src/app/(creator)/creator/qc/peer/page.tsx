export default function PeerReviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Peer Reviews</h1>
      <p className="text-muted-foreground">Livrables a reviewer pour d&apos;autres creatifs. Disponible a partir du tier COMPAGNON.</p>
      <div className="space-y-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Video TikTok — Orange</p>
              <p className="text-sm text-muted-foreground">Soumis par Paul E. (APPRENTI)</p>
            </div>
            <button className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">Reviewer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
