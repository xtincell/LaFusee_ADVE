"use client";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="grid grid-cols-3 gap-0 rounded-lg border" style={{ minHeight: 400 }}>
        <div className="border-r p-4">
          <p className="text-sm font-medium text-muted-foreground">Conversations</p>
          <div className="mt-3 space-y-2">
            <div className="rounded-md bg-muted p-2 text-sm">Équipe créative</div>
            <div className="rounded-md p-2 text-sm hover:bg-muted">Support UPgraders</div>
          </div>
        </div>
        <div className="col-span-2 flex items-center justify-center text-muted-foreground">
          Sélectionnez une conversation
        </div>
      </div>
    </div>
  );
}
