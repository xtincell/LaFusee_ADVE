"use client";

import { useState } from "react";

export default function BriefsPage() {
  const [brief, setBrief] = useState({ objective: "", targetAudience: "", keyMessage: "", channel: "" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Soumettre un brief</h1>
      <form className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Objectif</label>
          <input value={brief.objective} onChange={(e) => setBrief({...brief, objective: e.target.value})}
            className="w-full rounded-lg border px-4 py-3" placeholder="Que voulez-vous accomplir ?" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Audience cible</label>
          <input value={brief.targetAudience} onChange={(e) => setBrief({...brief, targetAudience: e.target.value})}
            className="w-full rounded-lg border px-4 py-3" placeholder="À qui s'adresse ce brief ?" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message clé</label>
          <textarea value={brief.keyMessage} onChange={(e) => setBrief({...brief, keyMessage: e.target.value})}
            rows={3} className="w-full rounded-lg border px-4 py-3" placeholder="Le message principal à transmettre" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Canal</label>
          <select value={brief.channel} onChange={(e) => setBrief({...brief, channel: e.target.value})}
            className="w-full rounded-lg border px-4 py-3">
            <option value="">Sélectionner un canal</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="TIKTOK">TikTok</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="VIDEO">Vidéo</option>
            <option value="PR">Relations Presse</option>
            <option value="EVENT">Événement</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Soumettre le brief
        </button>
      </form>
    </div>
  );
}
