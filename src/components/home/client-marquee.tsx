import Image from "next/image";
import type { Client } from "@/lib/data/clients";
import { mediaUrl } from "@/lib/media";

const MIN_ITEMS = 8;

function ClientItem({ client, hidden }: { client: Client; hidden?: boolean }) {
  return (
    <li aria-hidden={hidden || undefined} className="grid h-[clamp(88px,9vw,124px)] flex-none place-items-center px-[clamp(32px,5vw,72px)] text-[clamp(20px,2.2vw,30px)] font-bold tracking-[-0.02em] whitespace-nowrap text-muted transition-colors duration-[250ms] hover:text-text">
      {client.logo_path ? (
        <Image
          src={mediaUrl(client.logo_path)}
          alt={client.name}
          width={520}
          height={208}
          sizes="200px"
          className={`h-[clamp(34px,4vw,52px)] w-auto max-w-[200px] object-contain opacity-70 transition-[opacity,filter] duration-[250ms] hover:opacity-100 ${
            // Logo sombre affiché en blanc (case « Afficher en blanc »), sinon
            // gris, et en couleur au survol (prototype .mq__i img).
            client.logo_white ? "brightness-0 invert" : "grayscale hover:grayscale-0"
          }`}
        />
      ) : (
        <span>{client.name}</span>
      )}
    </li>
  );
}

// Bandeau « Ils nous font confiance » (cahier 6.2.4, prototype .mq) : boucle
// infinie en CSS (D49), en pause au survol et au focus, fondu sur les bords.
// La liste est lue une seule fois : la copie qui assure la boucle est masquée
// aux lecteurs d'écran. Mouvement réduit : grille fixe (globals.css).
export function ClientMarquee({ clients }: { clients: Client[] }) {
  let items = clients;
  while (items.length < MIN_ITEMS) items = items.concat(clients);
  const duration = Math.max(24, items.length * 5);

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Clients (défilement en pause au survol et au focus)"
      className="marquee overflow-hidden border-y border-line"
    >
      <div
        className="marquee-track flex w-max"
        style={{ "--mq-duration": `${duration}s` } as React.CSSProperties}
      >
        <ul className="flex flex-none">
          {items.map((client, i) => (
            // Répétitions ajoutées pour remplir le bandeau : masquées aux
            // lecteurs d'écran, chaque client n'est lu qu'une fois.
            <ClientItem key={`${client.id}-${i}`} client={client} hidden={i >= clients.length} />
          ))}
        </ul>
        <ul className="flex flex-none" aria-hidden="true">
          {items.map((client, i) => (
            <ClientItem key={`copie-${client.id}-${i}`} client={client} />
          ))}
        </ul>
      </div>
    </div>
  );
}
