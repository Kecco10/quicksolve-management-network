"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [openVideo, setOpenVideo] = useState(false);

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="relative flex h-[115px] items-center justify-center bg-white px-4 sm:h-[125px] md:h-[145px]">
          {/* LOGIN */}
          <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-4 md:right-8">
            <Link
              href="/login"
              className="inline-flex rounded-xl border border-[#0f3b2e] bg-white px-3.5 py-2 text-xs font-semibold text-[#0f3b2e] transition hover:bg-[#0f3b2e] hover:text-white sm:px-4 sm:text-sm"
            >
              Login
            </Link>
          </div>

          {/* LOGO - LINK AL SITO PRINCIPALE */}
          <a
            href="https://www.quicksolve.it/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vai al sito principale QuickSolve"
            className="group flex flex-col items-center"
          >
            <img
              src="/quicksolve-logo.png"
              alt="QuickSolve"
              width={320}
              height={140}
              className="h-auto w-[145px] cursor-pointer transition-opacity group-hover:opacity-80 sm:w-[170px] md:w-[225px]"
            />

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-500 transition-colors group-hover:text-[#0f3b2e] sm:text-[10px] md:text-xs md:tracking-[0.36em]">
              Engineering Network
            </p>
          </a>
        </header>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative">
          <div className="relative overflow-hidden bg-[#06372e]">
            {/* BACKGROUND TECNICO */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-cover
                bg-center
                opacity-100
                max-md:bg-[position:50%_center]
                md:bg-[position:center_center]
              "
              style={{
                backgroundImage: "url('/quicksolve-hero-bg.webp')",
              }}
            />

            {/* OVERLAY */}
            <div className="pointer-events-none absolute inset-0 bg-[#06372e]/45 md:bg-[#06372e]/20" />

            {/* GRADIENTE CENTRALE */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,70,54,0.15),rgba(2,42,34,0.12)_52%,rgba(1,28,24,0.25)_100%)]" />

            {/* CONTENUTO HERO */}
            <div
              className="
                relative
                z-10
                mx-auto
                flex
                min-h-[370px]
                max-w-6xl
                flex-col
                items-center
                justify-center
                px-5
                pb-[82px]
                pt-8
                text-center
                sm:min-h-[390px]
                sm:px-6
                sm:pb-[88px]
                md:min-h-[405px]
                md:px-8
                md:pb-[92px]
                md:pt-9
              "
            >
              {/* TITOLO */}
              <h1
                className="
                  max-w-[950px]
                  text-[32px]
                  font-extrabold
                  leading-[1.05]
                  tracking-tight
                  text-white
                  sm:text-[38px]
                  md:text-[48px]
                  lg:text-[54px]
                "
              >
                Il network italiano
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                della progettazione meccanica
              </h1>

              {/* DESCRIZIONE */}
              <p
                className="
                  mx-auto
                  mt-5
                  max-w-[800px]
                  text-[14px]
                  leading-6
                  text-white/90
                  sm:text-[15px]
                  sm:leading-6
                  md:mt-6
                  md:text-[17px]
                  md:leading-7
                "
              >
                Mettiamo in contatto aziende e progettisti qualificati
                attraverso un sistema intelligente, sviluppato per individuare
                rapidamente i profili compatibili con le specifiche esigenze
                di ogni progetto.
              </p>

              {/* CTA */}
              <div
                className="
                  mt-6
                  flex
                  w-full
                  max-w-[620px]
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:justify-center
                  md:mt-7
                "
              >
                {/* PROGETTISTA */}
                <Link
                  href="/progettista"
                  className="
                    group
                    flex
                    min-h-[54px]
                    flex-1
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    border
                    border-[#55a77d]
                    bg-[#075038]/80
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    backdrop-blur-[2px]
                    transition
                    hover:bg-[#126344]
                    sm:text-base
                  "
                >
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M4 21c1.8-4.2 5-6 8-6s6.2 1.8 8 6" />
                  </svg>

                  <span>Sono un progettista</span>

                  <span className="ml-auto text-xl transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                {/* AZIENDA */}
                <Link
                  href="/azienda"
                  className="
                    group
                    flex
                    min-h-[54px]
                    flex-1
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    border
                    border-white
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-[#0f3b2e]
                    shadow-lg
                    transition
                    hover:bg-[#eef5f2]
                    sm:text-base
                  "
                >
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M3 21h18" />
                    <path d="M6 21V5h8v16" />
                    <path d="M14 9h4v12" />
                    <path d="M9 9h1" />
                    <path d="M9 13h1" />
                    <path d="M9 17h1" />
                  </svg>

                  <span>Sono un&apos;azienda</span>

                  <span className="ml-auto text-xl transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* =================================================
                CURVA BIANCA INFERIORE
            ================================================== */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-20 h-[55px] sm:h-[65px] md:h-[78px]">
              <svg
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden="true"
              >
                <path
                  d="
                    M0 22
                    C320 92, 1120 92, 1440 22
                    L1440 120
                    L0 120
                    Z
                  "
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* =====================================================
            CARDS
        ====================================================== */}
        <section className="mx-auto w-full max-w-7xl bg-white px-4 pb-5 pt-3 sm:px-6 md:px-8 md:pb-6 md:pt-4">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {/* PROGETTISTI */}
            <div className="rounded-2xl border border-[#d7e6df] bg-[#eef5f2] p-4 shadow-sm sm:p-5">
              <h3 className="text-base font-bold text-[#0f3b2e] sm:text-lg">
                👷 Progettisti
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                Registrati gratuitamente in pochi secondi e ricevi opportunità
                in linea con le tue competenze.
              </p>
            </div>

            {/* AZIENDE */}
            <div className="rounded-2xl border border-[#d7e6df] bg-[#eef5f2] p-4 shadow-sm sm:p-5">
              <h3 className="text-base font-bold text-[#0f3b2e] sm:text-lg">
                🏭 Aziende
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                Inserisci il tuo progetto e individua rapidamente il
                progettista più adatto.
              </p>
            </div>

            {/* MATCHING */}
            <div className="rounded-2xl border border-[#d7e6df] bg-[#eef5f2] p-4 shadow-sm sm:p-5">
              <h3 className="text-base font-bold text-[#0f3b2e] sm:text-lg">
                🧠 Matching
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                Il sistema confronta la richiesta con i profili attivi nella rete e individua subito quelli compatibili.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            BANDA VIDEO
            STESSA LARGHEZZA DELLE CARD
        ====================================================== */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
          <button
            type="button"
            onClick={() => setOpenVideo(true)}
            className="
              group
              w-full
              cursor-pointer
              rounded-2xl
              bg-[#0f3b2e]
              px-5
              py-5
              text-center
              text-white
              shadow-sm
              transition
              duration-300
              hover:bg-[#14503f]
              hover:shadow-md
              sm:px-6
            "
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] sm:text-base md:tracking-[0.18em]">
              250+ progettisti nel network
            </p>

            <p className="mt-1.5 text-base font-semibold sm:text-lg">
              Sei un&apos;azienda? Scopri QuickSolve in 30 secondi
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </p>
          </button>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <footer className="border-t border-slate-200 bg-white px-4 pt-1.5 pb-3 sm:px-6">
          <div
            className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 text-center text-[12px] font-normal leading-4 text-slate-500 sm:flex-row sm:text-left sm:text-[13px]"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <p className="flex items-center">
              <span>QuickSolve Engineering Network · P.IVA IT04285011203</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <a
                href="https://www.linkedin.com/company/quicksolve-engineering-network/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn QuickSolve Engineering Network"
                className="inline-flex items-center align-middle transition hover:opacity-80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-[18px] w-[18px]"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2.5" fill="#0A66C2" />
                  <circle cx="8" cy="8" r="1.35" fill="white" />
                  <path d="M6.8 10.5h2.4V17H6.8z" fill="white" />
                  <path
                    d="M11 10.5h2.3v.9c.7-.8 1.6-1.2 2.7-1.2 2.1 0 3.2 1.3 3.2 3.8v3h-2.4v-2.7c0-1.4-.4-2.1-1.5-2.1-1.2 0-1.8.8-1.8 2.4V17H11z"
                    fill="white"
                  />
                </svg>
              </a>
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/legal/privacy-policy"
                className="transition hover:text-[#0f3b2e]"
              >
                Privacy Policy
              </Link>

              <span aria-hidden="true">·</span>

              <Link
                href="/cookie-policy"
                className="transition hover:text-[#0f3b2e]"
              >
                Cookie Policy
              </Link>

              <span aria-hidden="true">·</span>

              <Link
                href="/legal/condizioni-vendita"
                className="transition hover:text-[#0f3b2e]"
              >
                Condizioni di vendita
              </Link>

              <span aria-hidden="true">·</span>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("qs-open-cookie-settings"))
                }
                className="transition hover:text-[#0f3b2e]"
              >
                Gestisci cookie
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* =====================================================
          MODAL VIDEO
          MOBILE: GRANDE
          DESKTOP: PIÙ COMPATTO
      ====================================================== */}
      {openVideo && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
          onClick={() => setOpenVideo(false)}
        >
          <div
            className="
              relative
              w-full
              cursor-default
              overflow-hidden
              rounded-2xl
              bg-black
              shadow-2xl
              md:max-w-3xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* CHIUDI */}
            <button
              type="button"
              onClick={() => setOpenVideo(false)}
              className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/70 text-2xl font-light text-white transition hover:bg-black"
              aria-label="Chiudi video"
            >
              ×
            </button>

            {/* VIDEO */}
            <video
              src="/quicksolve-engineering.mp4"
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black object-contain"
            >
              Il tuo browser non supporta la riproduzione video.
            </video>

            {/* CTA SOTTO IL VIDEO */}
            <div className="flex flex-col items-center justify-between gap-3 bg-white px-5 py-4 text-center sm:flex-row sm:text-left">
              <div>
                <p className="font-bold text-[#0f3b2e]">
                  Hai bisogno di un progettista?
                </p>

                <p className="text-sm text-slate-600">
                  Inserisci gratuitamente la tua richiesta.
                </p>
              </div>

              <Link
                href="/azienda"
                onClick={() => setOpenVideo(false)}
                className="cursor-pointer rounded-xl bg-[#0f3b2e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14503f]"
              >
                Inserisci una richiesta →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}