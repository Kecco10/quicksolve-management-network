"use client";

import { useEffect, useState } from "react";

const CONSENT_COOKIE = "qs_cookie_consent";
const CONSENT_VERSION = "2026-09-05-v1";

type ConsentChoice = "accepted" | "rejected";

function getStoredConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));

  if (!match) return null;

  const value = decodeURIComponent(match.split("=")[1] || "");

  if (!value.startsWith(`${CONSENT_VERSION}:`)) return null;

  const choice = value.split(":")[1];
  return choice === "accepted" || choice === "rejected" ? choice : null;
}

function saveConsent(choice: ConsentChoice) {
  const maxAge = 180 * 24 * 60 * 60;

  document.cookie = [
    `${CONSENT_COOKIE}=${encodeURIComponent(`${CONSENT_VERSION}:${choice}`)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ].join("; ");
}

function loadLinkedInInsightTag() {
  if (typeof window === "undefined") return;

  const win = window as typeof window & {
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    lintrk?: ((a: string, b?: unknown) => void) & { q?: unknown[] };
  };

  if (document.getElementById("linkedin-insight-tag")) return;

  win._linkedin_partner_id = "9587202";
  win._linkedin_data_partner_ids = win._linkedin_data_partner_ids || [];

  if (!win._linkedin_data_partner_ids.includes("9587202")) {
    win._linkedin_data_partner_ids.push("9587202");
  }

  win.lintrk =
    win.lintrk ||
    Object.assign(
      function (a: string, b?: unknown) {
        win.lintrk?.q?.push([a, b]);
      },
      { q: [] as unknown[] }
    );

  const script = document.createElement("script");
  script.id = "linkedin-insight-tag";
  script.type = "text/javascript";
  script.async = true;
  script.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";

  document.head.appendChild(script);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();

    if (consent === "accepted") {
      loadLinkedInInsightTag();
      return;
    }

    if (consent === "rejected") return;

    setVisible(true);
  }, []);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("qs-open-cookie-settings", handler);
    return () => window.removeEventListener("qs-open-cookie-settings", handler);
  }, []);

  function choose(choice: ConsentChoice) {
    saveConsent(choice);
    setVisible(false);

    if (choice === "accepted") {
      loadLinkedInInsightTag();
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[100] px-4 sm:bottom-5">
      <div
        className="mx-auto flex max-w-4xl flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.14)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
        role="dialog"
        aria-label="Preferenze cookie"
      >
        <p className="max-w-2xl text-[12px] leading-5 text-slate-600 sm:text-[13px]">
          Utilizziamo cookie tecnici necessari e, solo con il tuo consenso,
          LinkedIn Insight Tag per misurare le campagne.{" "}
          <a
            href="/cookie-policy"
            className="font-medium text-[#0b2340] underline underline-offset-2"
          >
            Cookie Policy
          </a>
        </p>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Rifiuta
          </button>

          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-lg bg-[#0b2340] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#12385f]"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
