export const CHARM_CLASS = "https://vocab.essence.ooo/charm";

export const TEXT_PREDICATE = "http://schema.org/text";
export const CREATED_PREDICATE = "http://www.w3.org/2002/12/cal/ical#created";
export const TYPE_PREDICATE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export const NAME_PREDICATE = "https://schema.org/name";
export const SCHEMA_VERSION_PREDICATE = "https://schema.org/schemaVersion";

interface V0 {
  name: string;
  body: string;
  type: typeof CHARM_CLASS;
  schemaVersion: 0;
}

export type CharmShape = {
  V0: V0;
};
