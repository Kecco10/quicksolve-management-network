import { ProgettistaProfile } from "@/lib/progettista-data";

type SectionKey =
  | "titoloStudio"
  | "esperienza"
  | "softwareCad"
  | "settori"
  | "zoneOperative"
  | "disponibilita"
  | "collaborazione"
  | "contatti";

type Props = {
  profile: ProgettistaProfile;
  activeSection: SectionKey | null;
  onSelectSection: (section: SectionKey) => void;
};

function SummaryCard({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-5 text-left shadow-sm transition ${
        active
          ? "border-emerald-800 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </p>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          Modifica
        </span>
      </div>

      <div className="mt-3 text-slate-800">{children}</div>
    </button>
  );
}

export default function ProgettistaSummary({
  profile,
  activeSection,
  onSelectSection,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SummaryCard
        title="Titolo di studio"
        active={activeSection === "titoloStudio"}
        onClick={() => onSelectSection("titoloStudio")}
      >
        <p className="text-lg font-semibold">{profile.titoloStudio}</p>
      </SummaryCard>

      <SummaryCard
        title="Esperienza"
        active={activeSection === "esperienza"}
        onClick={() => onSelectSection("esperienza")}
      >
        <p className="text-lg font-semibold">{profile.esperienza}</p>
      </SummaryCard>

      <SummaryCard
        title="Software CAD"
        active={activeSection === "softwareCad"}
        onClick={() => onSelectSection("softwareCad")}
      >
        <div className="flex flex-wrap gap-2">
          {profile.softwareCad.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </SummaryCard>

      <SummaryCard
        title="Settori industriali"
        active={activeSection === "settori"}
        onClick={() => onSelectSection("settori")}
      >
        <div className="flex flex-wrap gap-2">
          {profile.settori.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </SummaryCard>

      <SummaryCard
        title="Zone operative"
        active={activeSection === "zoneOperative"}
        onClick={() => onSelectSection("zoneOperative")}
      >
        <div className="flex flex-wrap gap-2">
          {profile.province.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </SummaryCard>

      <SummaryCard
        title="Disponibilità"
        active={activeSection === "disponibilita"}
        onClick={() => onSelectSection("disponibilita")}
      >
        <p className="text-lg font-semibold">{profile.disponibilita}</p>
      </SummaryCard>

      <SummaryCard
        title="Modalità di collaborazione"
        active={activeSection === "collaborazione"}
        onClick={() => onSelectSection("collaborazione")}
      >
        <p className="text-lg font-semibold">{profile.collaborazione}</p>
        <p className="mt-2 text-sm text-slate-600">
          Range: {profile.rangeEconomico}
        </p>
      </SummaryCard>

      <SummaryCard
        title="Contatti"
        active={activeSection === "contatti"}
        onClick={() => onSelectSection("contatti")}
      >
        <div className="space-y-2 text-sm">
          <p>WhatsApp: {profile.whatsapp}</p>
          <p>Email: {profile.email}</p>
          <p className="break-all">LinkedIn: {profile.linkedin || "-"}</p>
        </div>
      </SummaryCard>
    </div>
  );
}