import { z } from "zod";

// zod sans compilation à la volée (D95) : sinon zod teste `new Function` au
// premier usage, ce que la politique de sécurité du contenu (sans
// 'unsafe-eval') signale dans la console. La validation reste identique.
z.config({ jitless: true });

export { z };
