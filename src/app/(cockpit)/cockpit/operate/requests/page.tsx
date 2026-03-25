"use client";

import { useState } from "react";

export default function RequestsPage() {
  const [request, setRequest] = useState({ title: "", description: "", urgency: "medium" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Demandes d'intervention</h1>
      <p className="text-muted-foreground">Soumettez une demande ponctuelle à votre équipe.</p>
      <form className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input value={request.title} onChange={(e) => setRequest({...request, title: e.target.value})}
            className="w-full rounded-lg border px-4 py-3" placeholder="Ex: Mise à jour du logo" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={request.description} onChange={(e) => setRequest({...request, description: e.target.value})}
            rows={4} className="w-full rounded-lg border px-4 py-3" placeholder="Décrivez votre besoin" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Urgence</label>
          <select value={request.urgency} onChange={(e) => setRequest({...request, urgency: e.target.value})}
            className="w-full rounded-lg border px-4 py-3">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="critical">Critique</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Envoyer la demande
        </button>
      </form>
    </div>
  );
}
