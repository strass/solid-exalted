import {
  addUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  changeLogAsMarkdown,
  getSourceUrl,
  getThing,
  getUrlAll,
  saveSolidDatasetAt,
  setThing,
  SolidDataset,
} from "@inrupt/solid-client";
import { useDataset, useSession, useThing } from "@inrupt/solid-ui-react";
import { useMemo } from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { APP_ID, DEFAULT_APP_FOLDER } from ".";
import { TYPE_PREDICATE } from "./Charms/shape";
import Spinner from "./components/Spinner";
import { SolidContext } from "./context/Solid";
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

const AppInitializationStatus: FunctionComponent = () => {
  const [dataInstances, setDataInstances] = useState<string[]>([]);
  const {
    session: {
      info: { isLoggedIn, webId },
    },
    fetch,
  } = useSession();
  const { dataset: firstDataInstance, error: firstDataInstanceError } =
    useDataset(dataInstances[0]);

  const { dataset: profileDataset } = useDataset(webId);

  useEffect(() => {
    // If we already have dataInstances loaded we don't need to run the check again
    if (dataInstances.length) {
      return;
    }
    if (profileDataset && webId) {
      (async () => {
        const { public: publicIndices, private: privateIndices } =
          getTypeIndices(profileDataset, webId);
        const indices = [...publicIndices, ...privateIndices];
        console.debug(`Found ${indices.length} data indices`);
        if (indices.length > 0) {
          const typeIndices = await fetchAppDataRegistration(indices, fetch);
          console.debug(`Found ${typeIndices.length} type indices`);
          if (typeIndices.length === 0) {
            throw new Error("No TypeIndices found");
          }
          console.log(typeIndices);
          // If there are data registries available save them
          if (
            !typeIndices.every(
              (reg) =>
                reg.instances.length === 0 &&
                reg.instanceContainers.length === 0
            )
          ) {
            console.log("Found existing data instances");
            setDataInstances(
              typeIndices.flatMap((reg) => [
                ...reg.instances,
                ...reg.instanceContainers,
              ])
            );
          }
          // Otherwise create defaults
          // TODO: Prompts for user settings instead of setting a default for them
          else {
            console.log(
              "TODO: We are duplicating TypeRegistrations by running this too aggressively"
            );
            const firstPublicIndex = typeIndices.find(
              (d) => d.type === "listed"
            );
            if (!firstPublicIndex) {
              throw new Error("Could not find public index");
            }

            // Start assembling our new typeregistration
            let newRegistrationInstanceThing = createThing();
            newRegistrationInstanceThing = addUrl(
              newRegistrationInstanceThing,
              TYPE_PREDICATE,
              "http://www.w3.org/ns/solid/terms#TypeRegistration"
            );
            newRegistrationInstanceThing = addUrl(
              newRegistrationInstanceThing,
              "http://www.w3.org/ns/solid/terms#forClass",
              APP_ID
            );

            const profile = getThing(profileDataset, webId);
            if (!profile) {
              throw new Error("No profile found");
            }
            const podsUrls = getUrlAll(
              profile,
              "http://www.w3.org/ns/pim/space#storage"
            );

            if (!podsUrls?.[0]) {
              throw new Error("Profile contains no storage");
            }

            const defaultAppDataIndexUrl =
              `${podsUrls?.[0]}${DEFAULT_APP_FOLDER}index.ttl` as const;

            try {
              // Check whether index already exists
              let appDataIndexDataset: SolidDataset | undefined = undefined;

              try {
                appDataIndexDataset = await getSolidDataset(
                  defaultAppDataIndexUrl
                );
                console.debug("Found existing appDataIndexDataset");
              } catch (ex) {
                if (
                  ex.statusCode === 404 ||
                  // Not sure why I need this?
                  ex.statusCode === 401
                ) {
                  console.log("Creating appDataIndexDataset ...");
                  appDataIndexDataset = await saveSolidDatasetAt(
                    defaultAppDataIndexUrl,
                    createSolidDataset(),
                    {
                      fetch,
                    }
                  );
                  console.log("... Created");
                }
              }

              if (!appDataIndexDataset) {
                throw new Error("Problem finding/creating app data index");
              }

              console.log(appDataIndexDataset);

              newRegistrationInstanceThing = addUrl(
                newRegistrationInstanceThing,
                "http://www.w3.org/ns/solid/terms#instance",
                getSourceUrl(appDataIndexDataset) as string
              );

              const latestProfileDataset = await getSolidDataset(
                getSourceUrl(profileDataset) as string
              );

              const localUpdatedProfile = setThing(
                latestProfileDataset,
                newRegistrationInstanceThing
              );
              console.debug(
                "Updating profile dataset...\n",
                changeLogAsMarkdown(localUpdatedProfile)
              );
              await saveSolidDatasetAt(
                getSourceUrl(localUpdatedProfile) as string,
                localUpdatedProfile,
                {
                  fetch,
                }
              );
              console.debug("... Updated");
              setDataInstances([
                ...dataInstances,
                getSourceUrl(appDataIndexDataset) as string,
              ]);
            } catch (ex) {
              throw new Error(ex);
            }
          }
        } else {
          throw new Error("No type index found");
        }
      })();
    }
  }, [dataInstances, fetch, profileDataset, webId]);

  const value = useMemo(
    () => ({
      dataInstances,
    }),
    [dataInstances]
  );

  if (!isLoggedIn || !webId) return null;
  if (firstDataInstanceError && firstDataInstanceError.statusCode === 404) {
    return <span>init...</span>;
  } else if (firstDataInstanceError) {
    throw new Error(firstDataInstanceError);
  }
  if (!firstDataInstance) {
    return <Spinner loading />;
  }

  return (
    <SolidContext.Provider value={value}>
      <Outlet />
    </SolidContext.Provider>
  );
};

export default AppInitializationStatus;
