// Types de la base Supabase, écrits à la main d'après
// supabase/migrations/0001_init.sql et 0002_contact_rate_limit.sql
// (pas de génération automatique).
// À mettre à jour dans le même prompt que toute nouvelle migration.
//
// Conventions (format attendu par supabase-js) :
// - Row : une ligne lue ; une colonne nullable est typée `| null`.
// - Insert : une colonne nullable ou avec valeur par défaut est facultative.
// - Update : toutes les colonnes sont facultatives.
// - Les types sont déclarés avec `type` (et non `interface`) pour rester
//   compatibles avec les contraintes génériques de supabase-js.

/** Catégories autorisées, dans l'ordre de la contrainte projects_category_check. */
export const PROJECT_CATEGORIES = [
  "Film institutionnel",
  "Film corporate",
  "Spot publicitaire",
  "Film publicitaire",
  "Documentaire",
  "Reportage industriel",
  "Couverture événement",
  "Motion design",
  "Photographie",
  "Campagne multi-supports",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** Un chiffre clé de site_settings.stats (jsonb). */
export type SiteStat = {
  value: string;
  label: string;
};

type SiteSettingsRow = {
  id: number;
  hero_title: string;
  hero_sub: string | null;
  showreel_url: string | null;
  showreel_youtube_id: string | null;
  showreel_title: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  reply_promise: string;
  stats: SiteStat[];
  /** Photo d'ouverture de la page Le studio (migration 0004), null si vide. */
  studio_hero_path: string | null;
  updated_at: string;
};

type ProjectsRow = {
  id: string;
  slug: string;
  client: string;
  title: string;
  category: ProjectCategory;
  year: number | null;
  description: string | null;
  deliverables: string[];
  thumbnail_path: string | null;
  featured: boolean;
  published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

type ProjectVideosRow = {
  id: string;
  project_id: string;
  youtube_url: string;
  youtube_id: string;
  title: string | null;
  position: number;
};

type ProjectPhotosRow = {
  id: string;
  project_id: string;
  storage_path: string;
  alt: string | null;
  position: number;
  /** Dimensions en pixels, enregistrées au téléversement (migration 0003), null si inconnues. */
  width: number | null;
  height: number | null;
};

type ClientsRow = {
  id: string;
  name: string;
  logo_path: string | null;
  logo_white: boolean;
  position: number;
};

type TeamMembersRow = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_path: string | null;
  position: number;
};

type ContactMessagesRow = {
  id: string;
  name: string;
  organization: string | null;
  email: string;
  project_type: string | null;
  desired_date: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

type ContactSubmissionsRow = {
  id: string;
  ip_hash: string;
  created_at: string;
};

type BackstagePhotosRow = {
  id: string;
  storage_path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number;
  created_at: string;
};

type AdminUsersRow = {
  user_id: string;
  created_at: string;
};

// Insert : colonnes obligatoires (ni nullables, ni avec valeur par défaut)
// conservées, toutes les autres rendues facultatives.
type InsertOf<Row, Required extends keyof Row> = Pick<Row, Required> &
  Partial<Omit<Row, Required>>;

type SiteSettingsInsert = InsertOf<SiteSettingsRow, "hero_title">;
type ProjectsInsert = InsertOf<ProjectsRow, "slug" | "client" | "title" | "category">;
type ProjectVideosInsert = InsertOf<ProjectVideosRow, "project_id" | "youtube_url" | "youtube_id">;
type ProjectPhotosInsert = InsertOf<ProjectPhotosRow, "project_id" | "storage_path">;
type ClientsInsert = InsertOf<ClientsRow, "name">;
type TeamMembersInsert = InsertOf<TeamMembersRow, "name">;
type ContactMessagesInsert = InsertOf<ContactMessagesRow, "name" | "email" | "message">;
type ContactSubmissionsInsert = InsertOf<ContactSubmissionsRow, "ip_hash">;
type AdminUsersInsert = InsertOf<AdminUsersRow, "user_id">;
type BackstagePhotosInsert = InsertOf<BackstagePhotosRow, "storage_path">;

type ProjectRelationship<Name extends string> = {
  foreignKeyName: Name;
  columns: ["project_id"];
  isOneToOne: false;
  referencedRelation: "projects";
  referencedColumns: ["id"];
};

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: SiteSettingsRow;
        Insert: SiteSettingsInsert;
        Update: Partial<SiteSettingsRow>;
        Relationships: [];
      };
      projects: {
        Row: ProjectsRow;
        Insert: ProjectsInsert;
        Update: Partial<ProjectsRow>;
        Relationships: [];
      };
      project_videos: {
        Row: ProjectVideosRow;
        Insert: ProjectVideosInsert;
        Update: Partial<ProjectVideosRow>;
        Relationships: [ProjectRelationship<"project_videos_project_id_fkey">];
      };
      project_photos: {
        Row: ProjectPhotosRow;
        Insert: ProjectPhotosInsert;
        Update: Partial<ProjectPhotosRow>;
        Relationships: [ProjectRelationship<"project_photos_project_id_fkey">];
      };
      clients: {
        Row: ClientsRow;
        Insert: ClientsInsert;
        Update: Partial<ClientsRow>;
        Relationships: [];
      };
      team_members: {
        Row: TeamMembersRow;
        Insert: TeamMembersInsert;
        Update: Partial<TeamMembersRow>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessagesRow;
        Insert: ContactMessagesInsert;
        Update: Partial<ContactMessagesRow>;
        Relationships: [];
      };
      // Accès réservé à la clé service (migration 0002).
      contact_submissions: {
        Row: ContactSubmissionsRow;
        Insert: ContactSubmissionsInsert;
        Update: Partial<ContactSubmissionsRow>;
        Relationships: [];
      };
      // user_id référence auth.users (schéma auth, hors de ce type).
      // Photos « Dans les coulisses » (migration 0004).
      backstage_photos: {
        Row: BackstagePhotosRow;
        Insert: BackstagePhotosInsert;
        Update: Partial<BackstagePhotosRow>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUsersRow;
        Insert: AdminUsersInsert;
        Update: Partial<AdminUsersRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicTables = Database["public"]["Tables"];

/** Ligne lue d'une table : Tables<"projects">. */
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
