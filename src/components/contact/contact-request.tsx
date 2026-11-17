"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
  type Ref,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CONTACT_FORM, CONTACT_NO_JS_NOTES } from "@/content/contact";
import {
  EVENT_DURATIONS,
  HONEYPOT_FIELD,
  PHOTO_KINDS,
  PROJECT_TYPES,
  WHEN_CHOICES,
  parseContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact/schema";
import {
  progressShare,
  recapOf,
  relevantAnswers,
  stepsFor,
  type Answers,
  type StepKey,
} from "@/lib/contact/steps";

type Step = StepKey | "done";
type Details = {
  message: string;
  name: string;
  organization: string;
  email: string;
};
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string };

const TAP_DELAY = 280;
const EMPTY_DETAILS: Details = {
  message: "",
  name: "",
  organization: "",
  email: "",
};
// Champs visibles à la dernière étape ; une erreur sur un autre champ
// (réponse d'une étape précédente) est affichée dans l'encadré d'alerte.
const DETAIL_FIELDS: ContactField[] = [
  "message",
  "name",
  "organization",
  "email",
];

const RING =
  "M4,50A46,46 0 1 0 96,50A46,46 0 1 0 4,50ZM16.19,52.898A38.64,38.64 0 1 0 93.47,52.898A38.64,38.64 0 1 0 16.19,52.898Z";

const subscribeNothing = () => () => {};
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Éclipse du logo officiel (anneau, disque, point) : l'anneau se remplit
// selon les étapes franchies, le point brille après l'envoi (maquette .prog).
function Eclipse({
  share,
  lit,
  clipId,
}: {
  share: number;
  lit: boolean;
  clipId: string;
}) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path fillRule="evenodd" d={RING} />
        </clipPath>
      </defs>
      <path fillRule="evenodd" fill="#18262C" d={RING} />
      <g clipPath={`url(#${clipId})`}>
        <circle
          className="contact-prog__arc"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#2EC4CF"
          strokeWidth="18"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={String(100 - share * 100)}
          transform="rotate(-140 50 50)"
        />
      </g>
      <circle cx="54.83" cy="52.898" r="38.64" fill="#060A0C" />
      <circle
        className="contact-prog__dot"
        cx="16.126"
        cy="29.676"
        r="5.457"
        fill="#fff"
        opacity={lit ? 1 : 0}
      />
    </svg>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="contact-field">
      <label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-teal">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-erreur`} className="contact-field__err">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Honeypot({
  id,
  inputRef,
}: {
  id: string;
  inputRef?: Ref<HTMLInputElement>;
}) {
  // Champ piège : invisible pour les humains et les lecteurs d'écran.
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[10000px] h-px w-px overflow-hidden"
    >
      <label htmlFor={id}>Site web</label>
      <input
        ref={inputRef}
        id={id}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

function Legal() {
  return (
    <p className="contact-legal">
      {CONTACT_FORM.legal}{" "}
      <Link href="/mentions-legales">{CONTACT_FORM.legalLink}</Link>
    </p>
  );
}

// Formulaire Contact (cahier 6.7, maquette .conv, D101). Avec JavaScript :
// une question à la fois, un choix de pilule fait avancer, anneau de
// progression, récapitulatif, Retour, puis envoi en JSON à /api/contact.
// Sans JavaScript : toutes les questions dans un seul formulaire classique
// (pilules en boutons radio), envoi classique et redirection 303 (D63).
export function ContactRequest({
  replyPromise,
}: {
  replyPromise: string | null;
}) {
  const ns = useId();
  const js = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const [step, setStep] = useState<Step>("type");
  const [history, setHistory] = useState<StepKey[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [tapped, setTapped] = useState<string | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const panelRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const moved = useRef(false);
  const timer = useRef<number | null>(null);
  const firstError = useRef<ContactField | "alerte" | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  // Nouvelle étape : focus sur son titre (ou sur la confirmation) et page
  // recalée sur le formulaire s'il est sorti de l'écran (mobile surtout).
  useEffect(() => {
    if (!moved.current) return;
    const target = step === "done" ? doneRef.current : headingRef.current;
    target?.focus({ preventScroll: true });
    const panel = panelRef.current;
    if (!panel) return;
    const top = panel.getBoundingClientRect().top;
    if (top < 70 || top > window.innerHeight * 0.5) {
      window.scrollBy({
        top: top - 90,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
    }
  }, [step]);

  // Après une erreur de validation : focus sur le premier champ à corriger.
  useEffect(() => {
    const field = firstError.current;
    if (!field) return;
    firstError.current = null;
    document
      .getElementById(field === "alerte" ? `${ns}-alerte` : `${ns}-${field}`)
      ?.focus();
  }, [errors, status, ns]);

  const steps = stepsFor(answers.projectType);
  const goTo = (next: Step, push: boolean) => {
    moved.current = true;
    setTapped(null);
    if (push && step !== "done") setHistory((h) => [...h, step]);
    setStep(next);
  };
  const nextAfter = (current: StepKey, type: string | undefined) => {
    const list = stepsFor(type);
    return list[list.indexOf(current) + 1] ?? "details";
  };

  const choose = (key: keyof Answers, value: string) => {
    if (step === "done" || timer.current) return;
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTapped(value);
    const current = step;
    timer.current = window.setTimeout(
      () => {
        timer.current = null;
        goTo(nextAfter(current, updated.projectType), true);
      },
      reducedMotion() ? 0 : TAP_DELAY,
    );
  };

  const back = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    moved.current = true;
    setHistory((h) => h.slice(0, -1));
    setTapped(null);
    setStep(previous);
  };

  const restart = () => {
    setAnswers({});
    setDetails(EMPTY_DETAILS);
    setErrors({});
    setStatus({ kind: "idle" });
    setHistory([]);
    moved.current = true;
    setStep("type");
  };

  const send = async () => {
    if (status.kind === "sending") return;
    const payload: Record<string, string> = {
      ...(relevantAnswers(answers) as Record<string, string>),
      ...details,
      [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
    };
    const parsed = parseContact(payload);
    if (!parsed.ok) {
      const first = DETAIL_FIELDS.find((f) => parsed.errors[f]);
      firstError.current = first ?? "alerte";
      setErrors(parsed.errors);
      setStatus({ kind: "idle" });
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok: boolean;
        errors?: ContactErrors;
        message?: string;
      };
      if (response.ok && result.ok) {
        setStatus({ kind: "idle" });
        setHistory([]);
        goTo("done", false);
        return;
      }
      if (result.errors) {
        const first = DETAIL_FIELDS.find((f) => result.errors?.[f]);
        firstError.current = first ?? "alerte";
        setErrors(result.errors);
        setStatus({ kind: "idle" });
      } else {
        firstError.current = "alerte";
        setStatus({
          kind: "error",
          message: result.message ?? "L’envoi a échoué. Merci de réessayer.",
        });
      }
    } catch {
      firstError.current = "alerte";
      setStatus({
        kind: "error",
        message:
          "L’envoi a échoué (connexion interrompue). Merci de réessayer, ou de nous contacter directement.",
      });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === "eventDate")
      goTo(nextAfter("eventDate", answers.projectType), true);
    else if (step === "details") void send();
  };

  const notes = CONTACT_NO_JS_NOTES.map((note) => (
    <p
      key={note.id}
      id={note.id}
      role="status"
      className="mt-6 hidden scroll-mt-32 border border-line bg-bg p-5 target:block"
    >
      {note.text}
    </p>
  ));

  const aside = (
    <div className="contact-conv__aside">
      <p className="contact-kicker">{CONTACT_FORM.kicker}</p>
      <h2 id="demande-titre">{CONTACT_FORM.title}</h2>
      <p className="contact-conv__lead">{CONTACT_FORM.lead}</p>
      {notes}
      {js ? (
        <>
          <div className="contact-prog">
            <Eclipse
              share={progressShare(step, answers.projectType)}
              lit={step === "done"}
              clipId={`${ns}-anneau`}
            />
            <p aria-live="polite">
              {step === "done" ? (
                <>
                  <b>{CONTACT_FORM.sentStep}</b>Merci
                </>
              ) : (
                <>
                  <b>
                    Étape {steps.indexOf(step) + 1} sur {steps.length}
                  </b>
                  {CONTACT_FORM.stepLabels[step]}
                </>
              )}
            </p>
          </div>
          {step !== "done" && recapOf(answers).length > 0 ? (
            <ul className="contact-recap" aria-label="Vos réponses">
              {recapOf(answers).map((value) => (
                <li key={value}>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );

  if (!js) return <NoScriptForm ns={ns} aside={aside} />;

  const backButton = history.length > 0 && (
    <button
      type="button"
      className="round"
      aria-label={CONTACT_FORM.back}
      onClick={back}
    >
      <ArrowLeft size={20} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );

  const heading = (text: string) => (
    <h3 ref={headingRef} id={`${ns}-question`} tabIndex={-1}>
      {text}
    </h3>
  );

  const pills = (key: keyof Answers, list: readonly string[]) => (
    <>
      <div
        className="contact-pills"
        role="group"
        aria-labelledby={`${ns}-question`}
      >
        {list.map((value) => (
          <button
            key={value}
            type="button"
            className={`pill${tapped === value ? " is-tap" : ""}`}
            aria-pressed={answers[key] === value}
            onClick={() => choose(key, value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="contact-nav">{backButton || <span />}</div>
    </>
  );

  const fieldProps = (field: ContactField) => ({
    id: `${ns}-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${ns}-${field}-erreur` : undefined,
  });
  const otherErrors = Object.entries(errors).filter(
    ([f]) => !DETAIL_FIELDS.includes(f as ContactField),
  );

  let body: ReactNode;
  switch (step) {
    case "type":
      body = (
        <>
          {heading(CONTACT_FORM.questions.type)}
          <p className="contact-q__hint">{CONTACT_FORM.pillHint}</p>
          {pills("projectType", PROJECT_TYPES)}
        </>
      );
      break;
    case "photo":
      body = (
        <>
          {heading(CONTACT_FORM.questions.photo)}
          {pills("photoKind", PHOTO_KINDS)}
        </>
      );
      break;
    case "eventDays":
      body = (
        <>
          {heading(CONTACT_FORM.questions.eventDays)}
          <p className="contact-q__hint">
            {CONTACT_FORM.questions.eventDays_hint}
          </p>
          {pills("eventDuration", EVENT_DURATIONS)}
        </>
      );
      break;
    case "eventDate":
      body = (
        <>
          {heading(CONTACT_FORM.questions.eventDate)}
          <div className="contact-fields">
            <Field id={`${ns}-eventDate`} label={CONTACT_FORM.eventDateLabel}>
              <input
                id={`${ns}-eventDate`}
                name="eventDate"
                type="text"
                maxLength={60}
                placeholder={CONTACT_FORM.eventDateExample}
                value={answers.eventDate ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, eventDate: e.target.value }))
                }
              />
            </Field>
          </div>
          <div className="contact-nav">
            {backButton || <span />}
            <button type="submit" className="btn">
              {CONTACT_FORM.continue}
              <span className="btn__ic" aria-hidden="true">
                <ArrowRight size={20} strokeWidth={1.8} />
              </span>
            </button>
          </div>
        </>
      );
      break;
    case "when":
      body = (
        <>
          {heading(CONTACT_FORM.questions.when)}
          {pills("desiredDate", WHEN_CHOICES)}
        </>
      );
      break;
    case "details":
      body = (
        <>
          {heading(CONTACT_FORM.questions.details)}
          <div className="contact-fields">
            <Field
              id={`${ns}-message`}
              label="Votre projet"
              required
              error={errors.message}
            >
              <textarea
                {...fieldProps("message")}
                aria-required="true"
                maxLength={5000}
                placeholder={
                  (answers.projectType &&
                    CONTACT_FORM.messageExamples[answers.projectType]) ||
                  CONTACT_FORM.messageExampleDefault
                }
                value={details.message}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, message: e.target.value }))
                }
              />
            </Field>
            <div className="contact-two">
              <Field id={`${ns}-name`} label="Nom" required error={errors.name}>
                <input
                  {...fieldProps("name")}
                  type="text"
                  autoComplete="name"
                  aria-required="true"
                  maxLength={120}
                  placeholder="Votre nom"
                  value={details.name}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, name: e.target.value }))
                  }
                />
              </Field>
              <Field
                id={`${ns}-organization`}
                label="Organisation"
                error={errors.organization}
              >
                <input
                  {...fieldProps("organization")}
                  type="text"
                  autoComplete="organization"
                  maxLength={160}
                  placeholder="Facultatif"
                  value={details.organization}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, organization: e.target.value }))
                  }
                />
              </Field>
            </div>
            <Field
              id={`${ns}-email`}
              label="Email"
              required
              error={errors.email}
            >
              <input
                {...fieldProps("email")}
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-required="true"
                maxLength={254}
                placeholder="vous@exemple.com"
                value={details.email}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, email: e.target.value }))
                }
              />
            </Field>
          </div>
          <Honeypot id={`${ns}-${HONEYPOT_FIELD}`} inputRef={honeypotRef} />
          <div
            id={`${ns}-alerte`}
            tabIndex={-1}
            role="alert"
            className="outline-none"
          >
            {status.kind === "error" ? (
              <p className="contact-alert">{status.message}</p>
            ) : otherErrors.length > 0 ? (
              <ul className="contact-alert list-none">
                {otherErrors.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <Legal />
          <div className="contact-nav">
            {backButton || <span />}
            <button
              type="submit"
              className="btn"
              disabled={status.kind === "sending"}
            >
              {status.kind === "sending"
                ? CONTACT_FORM.sending
                : CONTACT_FORM.submit}
              <span className="btn__ic" aria-hidden="true">
                <ArrowRight size={20} strokeWidth={1.8} />
              </span>
            </button>
          </div>
        </>
      );
      break;
    case "done":
      body = (
        <div
          ref={doneRef}
          tabIndex={-1}
          className="contact-done outline-none focus-visible:outline-2 focus-visible:outline-teal"
        >
          <Eclipse share={1} lit clipId={`${ns}-fin`} />
          <h3>{CONTACT_FORM.sent}</h3>
          <p>
            {CONTACT_FORM.sentLine}
            {replyPromise ? ` ${replyPromise}.` : ""}
          </p>
          <div className="contact-nav">
            <button type="button" className="btn btn--ghost" onClick={restart}>
              {CONTACT_FORM.again}
            </button>
          </div>
        </div>
      );
      break;
  }

  return (
    <>
      {aside}
      <form
        ref={panelRef}
        className="contact-panel"
        noValidate
        onSubmit={onSubmit}
        aria-labelledby="demande-titre"
      >
        <div key={step} className="contact-q">
          {body}
        </div>
      </form>
    </>
  );
}

// Sans JavaScript : un seul formulaire classique, envoyé à /api/contact qui
// redirige vers /contact avec une ancre (D63).
function NoScriptForm({ ns, aside }: { ns: string; aside: ReactNode }) {
  const radios = (name: string, list: readonly string[]) => (
    <div className="contact-pills">
      {list.map((value) => (
        <label key={value} className="pill">
          <input type="radio" name={name} value={value} className="sr-only" />
          {value}
        </label>
      ))}
    </div>
  );
  const optional = (
    <span className="text-muted"> {CONTACT_FORM.noJs.optional}</span>
  );

  return (
    <>
      {aside}
      <form
        action="/api/contact"
        method="post"
        className="contact-panel"
        aria-labelledby="demande-titre"
      >
        <fieldset className="contact-fieldset">
          <legend>{CONTACT_FORM.questions.type}</legend>
          {radios("projectType", PROJECT_TYPES)}
        </fieldset>
        <fieldset className="contact-fieldset">
          <legend>
            {CONTACT_FORM.noJs.photo}
            {optional}
          </legend>
          {radios("photoKind", PHOTO_KINDS)}
        </fieldset>
        <fieldset className="contact-fieldset">
          <legend>
            {CONTACT_FORM.noJs.eventDays}
            {optional}
          </legend>
          {radios("eventDuration", EVENT_DURATIONS)}
        </fieldset>
        <div className="contact-fields">
          <Field
            id={`${ns}-eventDate`}
            label={`${CONTACT_FORM.noJs.eventDate} ${CONTACT_FORM.noJs.optional}`}
          >
            <input
              id={`${ns}-eventDate`}
              name="eventDate"
              type="text"
              maxLength={60}
              placeholder={CONTACT_FORM.eventDateExample}
            />
          </Field>
        </div>
        <fieldset className="contact-fieldset">
          <legend>
            {CONTACT_FORM.questions.when}
            {optional}
          </legend>
          {radios("desiredDate", WHEN_CHOICES)}
        </fieldset>
        <div className="contact-fields mt-11">
          <Field id={`${ns}-message`} label="Votre projet" required>
            <textarea
              id={`${ns}-message`}
              name="message"
              required
              minLength={20}
              maxLength={5000}
              placeholder={CONTACT_FORM.messageExampleDefault}
            />
          </Field>
          <div className="contact-two">
            <Field id={`${ns}-name`} label="Nom" required>
              <input
                id={`${ns}-name`}
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={120}
                placeholder="Votre nom"
              />
            </Field>
            <Field id={`${ns}-organization`} label="Organisation">
              <input
                id={`${ns}-organization`}
                name="organization"
                type="text"
                autoComplete="organization"
                maxLength={160}
                placeholder="Facultatif"
              />
            </Field>
          </div>
          <Field id={`${ns}-email`} label="Email" required>
            <input
              id={`${ns}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="vous@exemple.com"
            />
          </Field>
        </div>
        <Honeypot id={`${ns}-${HONEYPOT_FIELD}`} />
        <Legal />
        <div className="contact-nav">
          <span />
          <button type="submit" className="btn">
            {CONTACT_FORM.submit}
            <span className="btn__ic" aria-hidden="true">
              <ArrowRight size={20} strokeWidth={1.8} />
            </span>
          </button>
        </div>
      </form>
    </>
  );
}
