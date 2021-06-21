import {
  createSolidDataset,
  getUrlAll,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { useDataset, useSession, useThing } from "@inrupt/solid-ui-react";
import { useState } from "react";
import { FunctionComponent, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { APP_POD_DIR } from ".";

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
  const { thing: profile } = useProfile();

  const podsUrls = profile
    ? getUrlAll(profile, "http://www.w3.org/ns/pim/space#storage")
    : null;

  if (profile && !podsUrls?.[0]) {
    throw new Error("Profile contains no storage");
  }

  return `${podsUrls?.[0]}${APP_POD_DIR}/index.ttl` as const;
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

  const initializeApp = useCallback(async () => {
    const r = await saveSolidDatasetAt(appIndexUrl, createSolidDataset(), {
      fetch,
    });
    if (!r) {
      throw new Error("Error creating app config");
    }
    setRefetchToggle((t) => t++);
  }, [appIndexUrl, fetch]);

  if (!isLoggedIn || !webId) return null;
  if (appConfigError && appConfigError.statusCode === 404) {
    return <button onClick={initializeApp}>Initialize App</button>;
  } else if (appConfigError) {
    throw new Error(appConfigError);
  }
  if (!appConfig) {
    console.warn("TODO: add spinner");
    return null;
  }
  return <Outlet />;
};

export default AppInitializationStatus;
