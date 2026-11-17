"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { saveSettings } from "@/app/admin/actions";
import { Field, errorProps, inputClass } from "@/components/admin/field";
import { Panel } from "@/components/admin/page-head";
import { Toast } from "@/components/admin/toast";
import { btnLine, btnSmall, btnSolid } from "@/components/admin/ui";
import { useClientCheck } from "@/components/admin/use-client-check";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import { idleState } from "@/lib/admin/action-state";
import { STATS_MAX, settingsSchema, validate } from "@/lib/admin/schemas";
import type { SiteStat } from "@/types/database";

export type SettingsValues = {
  heroTitle: string;
  heroSub: string;
  phone: string;
  email: string;
  city: string;
  replyPromise: string;
  stats: SiteStat[];
};

type StatRow = SiteStat & { key: number };

const snapshot = (values: SettingsValues) => JSON.stringify(values);

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [state, action, pending] = useActionState(saveSettings, idleState);
  const nextKey = useRef(initial.stats.length);

  const [fields, setFields] = useState(() => ({
    heroTitle: initial.heroTitle,
    heroSub: initial.heroSub,
    phone: initial.phone,
    email: initial.email,
    city: initial.city,
    replyPromise: initial.replyPromise,
  }));
  // Chaque ligne garde une clé stable : ajouter ou retirer une ligne ne
  // déplace jamais une saisie vers une autre ligne.
  const [stats, setStats] = useState<StatRow[]>(() => initial.stats.map((s, key) => ({ ...s, key })));
  const [saved, setSaved] = useState(() => snapshot(initial));
  const [handledAt, setHandledAt] = useState<number | undefined>(undefined);

  const values: SettingsValues = {
    ...fields,
    stats: stats.map(({ value, label }) => ({ value, label })),
  };
  const current = snapshot(values);

  if (state.at !== handledAt) {
    setHandledAt(state.at);
    if (state.status === "success") setSaved(current);
  }

  const dirty = current !== saved;
  useUnsavedChanges(dirty);
  const { errors, toast, run } = useClientCheck(state);

  const set = (key: keyof typeof fields) => (event: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: event.target.value }));

  const setStat = (key: number, field: keyof SiteStat, value: string) =>
    setStats((rows) => rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));

  function addStat() {
    if (stats.length >= STATS_MAX) return;
    setStats((rows) => [...rows, { key: nextKey.current++, value: "", label: "" }]);
  }

  function removeStat(key: number) {
    setStats((rows) => rows.filter((row) => row.key !== key));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const check = validate(settingsSchema, values);
    run(event, check.ok ? null : check.errors);
  }

  return (
    <form action={action} onSubmit={onSubmit} noValidate>
      <Panel title="Hero (accueil)">
        <Field id="s-ht" label="Phrase principale" error={errors.heroTitle}>
          <textarea
            id="s-ht"
            name="heroTitle"
            rows={2}
            required
            value={fields.heroTitle}
            onChange={set("heroTitle")}
            className={`${inputClass} min-h-[90px] resize-y`}
            {...(errors.heroTitle ? { "aria-invalid": true, "aria-describedby": "s-ht-erreur" } : {})}
          />
        </Field>
        <Field id="s-hs" label="Ligne au-dessus" error={errors.heroSub} className="!mb-0">
          <input
            id="s-hs"
            name="heroSub"
            value={fields.heroSub}
            onChange={set("heroSub")}
            className={inputClass}
            {...errorProps("s-hs", errors.heroSub)}
          />
        </Field>
      </Panel>

      <Panel title="Chiffres clés (page Le studio)">
        {stats.length === 0 ? (
          <p className="mb-[18px] text-sm text-muted">Aucun chiffre clé : le bloc est masqué sur le site.</p>
        ) : (
          <ol className="m-0 list-none p-0">
            {stats.map((row, index) => {
              const vErr = errors[`stats.${index}.value`];
              const lErr = errors[`stats.${index}.label`];
              const vid = `s-n${row.key}`;
              const lid = `s-l${row.key}`;
              return (
                <li
                  key={row.key}
                  className="grid grid-cols-1 gap-x-4 border-t border-line pt-4 first:border-t-0 first:pt-0 min-[700px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] min-[700px]:items-start"
                >
                  <Field id={vid} label={`Valeur ${index + 1}`} error={vErr}>
                    <input
                      id={vid}
                      value={row.value}
                      maxLength={12}
                      onChange={(e) => setStat(row.key, "value", e.target.value)}
                      className={inputClass}
                      {...errorProps(vid, vErr)}
                    />
                  </Field>
                  <Field id={lid} label={`Libellé ${index + 1}`} error={lErr}>
                    <input
                      id={lid}
                      value={row.label}
                      maxLength={40}
                      onChange={(e) => setStat(row.key, "label", e.target.value)}
                      className={inputClass}
                      {...errorProps(lid, lErr)}
                    />
                  </Field>
                  <div className="mb-[18px] min-[700px]:pt-[30px]">
                    <button
                      type="button"
                      onClick={() => removeStat(row.key)}
                      className={`${btnLine} ${btnSmall} hover:!border-danger hover:!text-danger`}
                    >
                      <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                      Retirer<span className="sr-only"> le chiffre clé {index + 1}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {errors.stats ? (
          <p role="alert" className="mb-4 text-sm text-danger">
            {errors.stats}
          </p>
        ) : null}
        {stats.length < STATS_MAX ? (
          <button type="button" onClick={addStat} className={`${btnLine} ${btnSmall}`}>
            <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
            Ajouter un chiffre clé
          </button>
        ) : (
          <p className="text-sm text-muted">{STATS_MAX} chiffres clés au maximum.</p>
        )}
        <input type="hidden" name="stats" value={JSON.stringify(values.stats)} />
      </Panel>

      <Panel title="Coordonnées">
        <div className="grid grid-cols-1 gap-x-5 min-[1000px]:grid-cols-2">
          <Field id="s-ph" label="Téléphone" error={errors.phone}>
            <input
              id="s-ph"
              name="phone"
              type="tel"
              autoComplete="off"
              value={fields.phone}
              onChange={set("phone")}
              className={inputClass}
              {...errorProps("s-ph", errors.phone)}
            />
          </Field>
          <Field id="s-em" label="Email" error={errors.email}>
            <input
              id="s-em"
              name="email"
              type="email"
              autoComplete="off"
              value={fields.email}
              onChange={set("email")}
              className={inputClass}
              {...errorProps("s-em", errors.email)}
            />
          </Field>
          <Field id="s-ci" label="Localisation" error={errors.city}>
            <input
              id="s-ci"
              name="city"
              value={fields.city}
              onChange={set("city")}
              className={inputClass}
              {...errorProps("s-ci", errors.city)}
            />
          </Field>
          <Field id="s-re" label="Promesse de réponse" error={errors.replyPromise}>
            <input
              id="s-re"
              name="replyPromise"
              required
              value={fields.replyPromise}
              onChange={set("replyPromise")}
              className={inputClass}
              {...errorProps("s-re", errors.replyPromise)}
            />
          </Field>
        </div>
      </Panel>

      <div className="sticky bottom-0 z-10 mb-6 flex flex-wrap items-center gap-3 border-t border-line bg-bg py-4">
        <button type="submit" disabled={pending} className={btnSolid}>
          <Save size={18} strokeWidth={1.8} aria-hidden="true" />
          {pending ? "Enregistrement en cours" : "Enregistrer les réglages"}
        </button>
        {dirty ? <span className="text-sm text-muted">Modifications non enregistrées</span> : null}
      </div>
      <Toast state={toast} />
    </form>
  );
}
