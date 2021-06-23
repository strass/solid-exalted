import {
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
  getUrlAll,
  SolidDataset,
  getSourceUrl,
} from "@inrupt/solid-client";
import { APP_ID } from ".";
import { TYPE_PREDICATE } from "./Charms/shape";

export const getTypeIndices = (
  profileDataset: SolidDataset,
  webId: string
): Record<"public" | "private", string[]> => {
  if (!profileDataset || !webId) return { public: [], private: [] };
  const profile = getThing(profileDataset, webId);
  if (!profile) {
    throw new Error("No profile found");
  }

  return {
    public: getUrlAll(
      profile,
      "http://www.w3.org/ns/solid/terms#publicTypeIndex"
    ),
    private: getUrlAll(
      profile,
      "http://www.w3.org/ns/solid/terms#privateTypeIndex"
    ),
  };
};

export const fetchAppDataRegistration = async (
  typeIndexWebIds: string[],
  fetch: typeof window.fetch
) =>
  await Promise.all(
    typeIndexWebIds.map(async (url) => {
      const typeIndexDataset = await getSolidDataset(url, { fetch });
      const allThings = getThingAll(typeIndexDataset);

      // I'm pretty sure we don't expect multiple TypeIndexes, but is there a better practice?
      const typeIndex = allThings.find((t) => {
        const thingTypes = getUrlAll(t, TYPE_PREDICATE);
        return thingTypes.includes(
          "http://www.w3.org/ns/solid/terms#TypeIndex"
        );
      });

      if (!typeIndex) {
        throw new Error(`Could not find TypeIndex in '${typeIndex}'`);
      }

      const isListed = getUrlAll(typeIndex, TYPE_PREDICATE).includes(
        "http://www.w3.org/ns/solid/terms#ListedDocument"
      );
      const isUnlisted = getUrlAll(typeIndex, TYPE_PREDICATE).includes(
        "http://www.w3.org/ns/solid/terms#UnlistedDocument"
      );

      const typeRegistrations = allThings
        .filter((t) => {
          const thingTypes = getUrlAll(t, TYPE_PREDICATE);
          return thingTypes.includes(
            "http://www.w3.org/ns/solid/terms#TypeRegistration"
          );
        })
        .filter((t) => {
          const forClass = getStringNoLocale(
            t,
            "http://www.w3.org/ns/solid/terms#forClass"
          );
          return forClass === APP_ID;
        });

      return {
        url: getSourceUrl(typeIndexDataset),
        dataset: typeIndexDataset,
        type: (isListed && "listed") || (isUnlisted && "unlisted") || undefined,
        instances: typeRegistrations.flatMap((tr) =>
          getUrlAll(tr, "http://www.w3.org/ns/solid/terms#instance")
        ),
        instanceContainers: typeRegistrations.flatMap((tr) =>
          getUrlAll(tr, "http://www.w3.org/ns/solid/terms#instanceContainer")
        ),
      };
    })
  );

export const findAppRegistry = () => {};
