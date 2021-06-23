import {
  setThing,
  addUrl,
  createSolidDataset,
  createThing,
  getSourceUrl,
  getThing,
  getUrlAll,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { useDataset, useSession, useThing } from "@inrupt/solid-ui-react";
import { FunctionComponent, useState } from "react";
import { Outlet } from "react-router-dom";
import { TYPE_PREDICATE } from "./Charms/shape";
import Spinner from "./components/Spinner";
import { fetchAppDataRegistration, getTypeIndices } from "./init";

export const useProfile = () => {
  const {
    session: {
      info: { webId },
    },
  } = useSession();

  const profile = useThing(webId, webId);

  if (profile.error) {
    throw new Error(profile.error);
  }

  return profile;
};

export const useGetAppConfigUrl = () => {
  const {
    session: {
      info: { isLoggedIn },
    },
  } = useSession();
  const { thing: profile, error } = useProfile();
  if (!isLoggedIn) {
    return undefined;
  }
  if (error) {
    throw new Error(error);
  }
  if (!profile) {
    return undefined;
  }
  const podsUrls = getUrlAll(profile, "http://www.w3.org/ns/pim/space#storage");

  if (profile && !podsUrls?.[0]) {
    throw new Error("Profile contains no storage");
  }

  return `${podsUrls?.[0]}exalted/index.ttl` as const;
};

const AppInitializationStatus: FunctionComponent = () => {
  const [refetchToggle, setRefetchToggle] = useState(0);
  const {
    session: {
      info: { isLoggedIn, webId },
    },
    fetch,
  } = useSession();
  const appIndexUrl = useGetAppConfigUrl();
  const { dataset: appConfig, error: appConfigError } = useDataset(
    appIndexUrl,
    refetchToggle
  );

  const { dataset: profileDataset } = useDataset(webId);
  if (profileDataset && webId) {
    const { public: publicIndices, private: privateIndices } = getTypeIndices(
      profileDataset,
      webId
    );
    const indices = [...publicIndices, ...privateIndices];
    if (indices.length > 0) {
      fetchAppDataRegistration(indices, fetch).then((list) => {
        console.log(list);
        if (list.length === 0) {
          throw new Error("No TypeIndices found");
        }
        // If there aren't any data registries, create defaults
        if (
          list.every(
            (d) => d.instances.length === 0 && d.instanceContainers.length === 0
          )
        ) {
          const firstPublicIndex = list.find((d) => d.type === "listed");
          if (!firstPublicIndex) {
            throw new Error("Could not find public index");
          }
          let newThing = createThing();
          newThing = addUrl(
            newThing,
            TYPE_PREDICATE,
            "http://www.w3.org/ns/solid/terms#TypeRegistration"
          );
          newThing = addUrl(
            newThing,
            "http://www.w3.org/ns/solid/terms#forClass",
            "exalted:Resource"
          );

          const profile = getThing(profileDataset, webId);
          if (!profile) {
            throw new Error("No profile found");
          }
          const podsUrls = getUrlAll(
            profile,
            "http://www.w3.org/ns/pim/space#storage"
          );

          if (profile && !podsUrls?.[0]) {
            throw new Error("Profile contains no storage");
          }

          const defaultAppDataIndexUrl =
            `${podsUrls?.[0]}exalted/index.ttl` as const;

          const exaltedIndexDataset = createSolidDataset();

          saveSolidDatasetAt(defaultAppDataIndexUrl, exaltedIndexDataset, {
            fetch,
          })
            .then((r) => {
              console.log(r);

              newThing = addUrl(
                newThing,
                "http://www.w3.org/ns/solid/terms#instance",
                defaultAppDataIndexUrl
              );

              saveSolidDatasetAt(
                getSourceUrl(profileDataset) as string,
                setThing(profileDataset, newThing),
                {
                  fetch,
                }
              );
              debugger;
              setRefetchToggle((t) => t++);
            })
            .catch((e) => {
              debugger;
              throw new Error(e);
            });
        }
      });
    } else {
      throw new Error("No type index found");
    }
  }

  if (!isLoggedIn || !webId) return null;
  if (appConfigError && appConfigError.statusCode === 404) {
    return <span>init...</span>;
  } else if (appConfigError) {
    throw new Error(appConfigError);
  }
  if (!appConfig) {
    return <Spinner loading />;
  }
  return <Outlet />;
};

export default AppInitializationStatus;
