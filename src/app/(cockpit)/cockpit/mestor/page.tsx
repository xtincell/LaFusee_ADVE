import { MestorPanel } from "@/components/shared/mestor-panel";

export default function MestorPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mestor AI</h1>
      <p className="text-muted-foreground">Votre assistant Brand OS — posez vos questions sur votre marque, vos guidelines, ou demandez un diagnostic.</p>
      <MestorPanel context="cockpit" className="h-[600px]" />
    </div>
  );
}
