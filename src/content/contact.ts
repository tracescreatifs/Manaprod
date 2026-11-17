// Page Contact (maquette docs/reference/mana-prod-contact-maquette.html,
// Prompt 15, D101) : textes affichés, regroupés ici pour une future version
// dans une autre langue. Les coordonnées et la promesse de réponse sont lues
// dans les réglages, jamais écrites ici.

export const CONTACT_HERO = {
  kicker: "Contact",
  title: ["Parlons", "de", "votre", "projet."],
  primary: "Décrire mon projet",
  whatsapp: "WhatsApp",
} as const;

export const CONTACT_FORM = {
  kicker: "Votre demande",
  title: "Décrivez votre projet.",
  lead: "Quelques lignes suffisent, nous revenons vers vous pour le reste. Moins d’une minute.",
  pillHint: "Touchez une réponse, la suite s’affiche.",
  questions: {
    type: "Quel type de projet ?",
    photo: "Quel type de photos ?",
    eventDays: "Sur combien de temps ?",
    eventDays_hint: "Pour prévoir l’équipe et les caméras.",
    eventDate: "Quand a lieu l’événement ?",
    when: "Pour quand ?",
    details: "Votre projet et vos coordonnées",
  },
  // Libellés courts de l'indicateur d'étape.
  stepLabels: {
    type: "Le type de projet",
    photo: "Les photos",
    eventDays: "L’événement",
    eventDate: "La date",
    when: "Le calendrier",
    details: "Votre projet",
  },
  eventDateLabel: "Date ou période",
  eventDateExample: "Ex. 12 et 13 décembre, Dakar",
  continue: "Continuer",
  back: "Étape précédente",
  submit: "Envoyer ma demande",
  sending: "Envoi en cours",
  legal: "Vos informations servent uniquement à répondre à votre demande.",
  legalLink: "Mentions légales",
  // Exemple du champ « Votre projet » selon le type choisi (maquette).
  messageExamples: {
    "Couverture événement":
      "Type d’événement, lieu, nombre d’invités, livrables souhaités...",
    Photographie:
      "Nombre de personnes ou de produits, lieu, usage des photos...",
    "Motion design": "Durée, message à expliquer, supports de diffusion...",
  } as Record<string, string>,
  messageExampleDefault: "Objectif, public, lieu, format souhaité...",
  sent: "Merci, votre demande est bien envoyée.",
  sentLine: "Un email de confirmation vient de partir.",
  sentStep: "Demande envoyée",
  again: "Nouvelle demande",
  // Formulaire sans JavaScript : toutes les questions en une fois.
  noJs: {
    photo: "Pour un projet de photographie : quel type de photos ?",
    eventDays: "Pour une couverture d’événement : sur combien de temps ?",
    eventDate: "Pour une couverture d’événement : quand a lieu l’événement ?",
    optional: "(facultatif)",
  },
} as const;

export const CONTACT_DIRECT = {
  title: "Vous préférez parler directement ?",
  call: "Appeler",
  whatsapp: "WhatsApp",
  whatsappLine: "Écrire maintenant",
  email: "Email",
} as const;

export const CONTACT_NEXT = {
  kicker: "Et ensuite",
  title: "Trois étapes, pas plus.",
  titleTwoSteps: "Deux étapes, pas plus.",
  // Étape 1 : promesse de réponse lue dans les réglages.
  steps: [
    "Un échange court pour cadrer le brief, le budget et le calendrier.",
    "Une proposition claire, puis le tournage.",
  ],
} as const;

// Messages de l'envoi sans JavaScript : /api/contact redirige vers /contact
// avec une ancre, la note correspondante s'affiche par :target (D63).
export const CONTACT_NO_JS_NOTES = [
  {
    id: "demande-envoyee",
    text: "Merci, votre demande est bien envoyée. Un email de confirmation vient de vous être adressé.",
  },
  {
    id: "demande-incomplete",
    text: "Votre demande n’a pas été envoyée : renseignez votre nom, une adresse email valide et au moins 20 caractères sur votre projet.",
  },
  {
    id: "demande-limite",
    text: "Vous avez déjà envoyé plusieurs demandes dans l’heure. Merci de réessayer plus tard, ou de nous appeler directement.",
  },
  {
    id: "demande-erreur",
    text: "Votre demande n’a pas pu être enregistrée. Merci de réessayer, ou de nous contacter directement par téléphone ou par email.",
  },
] as const;
