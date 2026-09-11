"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  progettistaMockProfile,
  updateProgettistaProfile,
} from "@/lib/progettista-data";

export default function ProgettistaModificaPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(progettistaMockProfile);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K]
  ) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await updateProgettistaProfile(formData);

    setSaving(false);
    router.push("/progettista/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-900">
              Area progettista
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Modifica profilo
            </h1>
            <p className="mt-2 text-slate-600">
              Aggiorna le informazioni principali del tuo profilo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome
                </label>
                <input
                  value={formData.nome}
                  onChange={(e) => updateField("nome", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Titolo di studio
                </label>
                <input
                  value={formData.titoloStudio}
                  onChange={(e) => updateField("titoloStudio", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Esperienza
                </label>
                <input
                  value={formData.esperienza}
                  onChange={(e) => updateField("esperienza", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Disponibilità
                </label>
                <input
                  value={formData.disponibilita}
                  onChange={(e) => updateField("disponibilita", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Modalità di collaborazione
                </label>
                <input
                  value={formData.collaborazione}
                  onChange={(e) => updateField("collaborazione", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Range economico
                </label>
                <input
                  value={formData.rangeEconomico}
                  onChange={(e) => updateField("rangeEconomico", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  WhatsApp
                </label>
                <input
                  value={formData.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  LinkedIn
                </label>
                <input
                  value={formData.linkedin}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Software CAD
                </label>
                <input
                  value={formData.softwareCad.join(", ")}
                  onChange={(e) =>
                    updateField(
                      "softwareCad",
                      e.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                    )
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Settori
                </label>
                <input
                  value={formData.settori.join(", ")}
                  onChange={(e) =>
                    updateField(
                      "settori",
                      e.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                    )
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Province / zone operative
                </label>
                <input
                  value={formData.province.join(", ")}
                  onChange={(e) =>
                    updateField(
                      "province",
                      e.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                    )
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-900"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/progettista/dashboard")}
                className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Annulla
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-emerald-950 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? "Salvataggio..." : "Salva modifiche"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}