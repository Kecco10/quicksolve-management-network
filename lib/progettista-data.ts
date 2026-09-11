export type ProgettistaProfile = {
  nome: string;
  titoloStudio: string;
  esperienza: string;
  softwareCad: string[];
  settori: string[];
  province: string[];
  disponibilita: string;
  collaborazione: string;
  rangeEconomico: string;
  whatsapp: string;
  email: string;
  linkedin: string;
};

export const progettistaMockProfile: ProgettistaProfile = {
  nome: "Progettista",
  titoloStudio: "Laurea Magistrale",
  esperienza: "6-10 anni",
  softwareCad: ["SolidWorks ★★★★★", "Inventor ★★★★☆"],
  settori: ["Automotive", "Packaging"],
  province: ["Bologna", "Modena"],
  disponibilita: "Entro 30 giorni",
  collaborazione: "Dipendente",
  rangeEconomico: "40.000 - 50.000 €",
  whatsapp: "+39 333 1234567",
  email: "nome@email.com",
  linkedin: "https://www.linkedin.com/in/tuo-profilo",
};

let currentProfile = { ...progettistaMockProfile };

export async function getProgettistaProfile() {
  return currentProfile;
}

export async function updateProgettistaProfile(
  payload: ProgettistaProfile
) {
  currentProfile = { ...payload };
  return currentProfile;
}