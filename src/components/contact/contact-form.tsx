"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import {
  HONEYPOT_FIELD,
  PROJECT_TYPES,
  parseContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact/schema";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const SUMMARY_INVALID = "Certains champs sont à corriger :";

const inputClass =
  "w-full min-w-0 border border-line bg-bg px-3.5 py-[13px] text-base leading-[1.4] text-text outline-none placeholder:text-muted focus:border-teal aria-[invalid=true]:border-danger";

const LABELS: Record<ContactField, string> = {
  name: "Nom",
  organization: "Organisation",
  email: "Email",
  projectType: "Type de projet",
  desiredDate: "Date souhaitée",
  message: "Votre projet",
};

// Formulaire de contact (cahier 6.7, prototype .cform). Avec JavaScript :
// validation immédiate puis envoi en fetch et réponse affichée dans la page.
// Sans JavaScript : envoi classique vers /api/contact, qui redirige vers
// /contact avec un message ciblé par l'ancre (D63).
export function ContactForm({
  replyPromise,
  phone,
  email,
}: {
  replyPromise: string | null;
  phone: string | null;
  email: string | null;
}) {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);

  const fallback = [phone, email].filter(Boolean).join(" ou ");

  // Focus sur la confirmation une fois affichée (le formulaire disparaît).
  useEffect(() => {
    if (status.kind === "sent") sentRef.current?.focus();
  }, [status.kind]);

  const showSummary = () => window.setTimeout(() => summaryRef.current?.focus(), 0);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "sending") return;
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

    const parsed = parseContact(values);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setStatus({ kind: "idle" });
      showSummary();
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        ok: boolean;
        errors?: ContactErrors;
        message?: string;
      };
      if (response.ok && result.ok) {
        setStatus({ kind: "sent" });
        return;
      }
      if (result.errors) {
        setErrors(result.errors);
        setStatus({ kind: "idle" });
      } else {
        setStatus({ kind: "error", message: result.message ?? "L’envoi a échoué." });
      }
    } catch {
      setStatus({
        kind: "error",
        message: `L’envoi a échoué (connexion interrompue). Merci de réessayer${fallback ? `, ou de nous contacter au ${fallback}` : ""}.`,
      });
    }
    showSummary();
  };

  if (status.kind === "sent") {
    return (
      <div
        ref={sentRef}
        tabIndex={-1}
        className="border border-line bg-bg-2 p-[clamp(22px,3vw,44px)] outline-none focus-visible:outline-2 focus-visible:outline-teal"
      >
        <h2 className="text-[clamp(22px,2vw,28px)] leading-[1.1] font-bold tracking-[-0.015em]">
          Merci, votre demande est bien envoyée.
        </h2>
        <p className="mt-3 text-muted">
          {replyPromise ? `${replyPromise}. ` : ""}Un email de confirmation vient de vous être
          adressé.
        </p>
      </div>
    );
  }

  const errorEntries = Object.entries(errors) as [ContactField, string][];
  const describedBy = (field: ContactField) => (errors[field] ? `${field}-erreur` : undefined);
  const fieldProps = (field: ContactField) => ({
    id: `contact-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": describedBy(field),
    className: inputClass,
  });
  const fieldError = (field: ContactField) =>
    errors[field] ? (
      <p id={`${field}-erreur`} className="text-sm text-danger">
        {errors[field]}
      </p>
    ) : null;
  const label = (field: ContactField, text?: string, required = false) => (
    <label htmlFor={`contact-${field}`} className="text-sm font-medium text-muted">
      {text ?? LABELS[field]}
      {required ? <span aria-hidden="true"> *</span> : null}
    </label>
  );

  return (
    <form
      action="/api/contact"
      method="post"
      noValidate
      onSubmit={onSubmit}
      className="border border-line bg-bg-2 p-[clamp(22px,3vw,44px)]"
    >
      <h2 className="mb-1.5 text-[clamp(22px,2vw,28px)] leading-[1.1] font-bold tracking-[-0.015em]">
        Décrivez votre projet
      </h2>
      <p className="mb-[26px] text-[15px] text-muted">
        Quelques lignes suffisent, nous revenons vers vous pour le reste.
      </p>

      <div
        ref={summaryRef}
        tabIndex={-1}
        aria-live="assertive"
        className="outline-none focus-visible:outline-2 focus-visible:outline-danger"
      >
        {errorEntries.length > 0 ? (
          <div className="mb-[18px] border border-danger p-4 text-[15px]">
            <p className="font-semibold text-danger">{SUMMARY_INVALID}</p>
            <ul className="mt-2 list-disc pl-5 text-text">
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a href={`#contact-${field}`} className="underline underline-offset-2">
                    {LABELS[field]}
                  </a>{" "}
                  : {message}
                </li>
              ))}
            </ul>
          </div>
        ) : status.kind === "error" ? (
          <p className="mb-[18px] border border-danger p-4 text-[15px] text-text">{status.message}</p>
        ) : null}
      </div>

      <div className="grid gap-x-4 min-[561px]:grid-cols-2">
        <div className="mb-[18px] flex min-w-0 flex-col gap-2">
          {label("name", undefined, true)}
          <input {...fieldProps("name")} type="text" autoComplete="name" aria-required="true" placeholder="Votre nom" maxLength={120} />
          {fieldError("name")}
        </div>
        <div className="mb-[18px] flex min-w-0 flex-col gap-2">
          {label("organization")}
          <input {...fieldProps("organization")} type="text" autoComplete="organization" placeholder="Entreprise ou institution" maxLength={160} />
          {fieldError("organization")}
        </div>
      </div>

      <div className="grid gap-x-4 min-[561px]:grid-cols-2">
        <div className="mb-[18px] flex min-w-0 flex-col gap-2">
          {label("email", undefined, true)}
          <input {...fieldProps("email")} type="email" inputMode="email" autoComplete="email" aria-required="true" placeholder="vous@exemple.com" maxLength={254} />
          {fieldError("email")}
        </div>
        <div className="mb-[18px] flex min-w-0 flex-col gap-2">
          {label("projectType")}
          <select {...fieldProps("projectType")} defaultValue="">
            <option value="">Choisir</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fieldError("projectType")}
        </div>
      </div>

      <div className="mb-[18px] flex min-w-0 flex-col gap-2">
        {label("desiredDate", "Date souhaitée (facultatif)")}
        <input {...fieldProps("desiredDate")} type="text" placeholder="Ex : fin novembre, ou dès que possible" maxLength={60} />
        {fieldError("desiredDate")}
      </div>

      <div className="mb-[18px] flex min-w-0 flex-col gap-2">
        {label("message", undefined, true)}
        <textarea
          {...fieldProps("message")}
          aria-required="true"
          rows={6}
          placeholder="Objectif, public visé, durée, lieux de tournage..."
          maxLength={5000}
          className={`${inputClass} min-h-[130px] resize-y`}
        />
        {fieldError("message")}
      </div>

      {/* Champ piège : invisible pour les humains et les lecteurs d'écran. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`contact-${HONEYPOT_FIELD}`}>Site web</label>
        <input id={`contact-${HONEYPOT_FIELD}`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="mb-[18px] text-sm text-muted">
        <span aria-hidden="true">* </span>Champs obligatoires.
      </p>

      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2.5 bg-teal px-6 py-[18px] text-base leading-none font-semibold text-ink transition-colors hover:bg-teal-hi disabled:cursor-wait disabled:opacity-70"
      >
        {status.kind === "sending" ? "Envoi en cours" : "Envoyer ma demande"}
        {status.kind === "sending" ? null : <ArrowRight aria-hidden="true" size={18} strokeWidth={1.8} />}
      </button>

      <p className="mt-2.5 text-sm text-muted">
        Vos informations servent uniquement à répondre à votre demande. En savoir plus :{" "}
        <Link href="/mentions-legales" className="text-text underline underline-offset-2 hover:text-teal">
          mentions légales
        </Link>
        .
      </p>
    </form>
  );
}
