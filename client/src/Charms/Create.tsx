import {
  addDatetime,
  addInteger,
  addStringNoLocale,
  addUrl,
  createThing,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { useDataset, useSession } from "@inrupt/solid-ui-react";
import { FunctionComponent, useState } from "react";
import { CHARM_SCHEMA_VERSION } from "..";
import { useGetAppConfigUrl } from "../InitializeApp";
import {
  CHARM_CLASS,
  CREATED_PREDICATE,
  SCHEMA_VERSION_PREDICATE,
  TEXT_PREDICATE,
  TYPE_PREDICATE,
} from "./shape";

const CharmsCreate: FunctionComponent = () => {
  const { fetch } = useSession();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const version = CHARM_SCHEMA_VERSION;

  const appConfigUrl = useGetAppConfigUrl();

  const { dataset: appConfig, error } = useDataset(appConfigUrl);
  if (error) {
    throw new Error(error);
  }

  if (!appConfig) {
    console.warn("TODO: add loading");
    return null;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const charmText = addStringNoLocale(
          createThing(),
          TEXT_PREDICATE,
          body
        );
        const charmCreated = addDatetime(
          charmText,
          CREATED_PREDICATE,
          new Date()
        );
        const charmType = addUrl(charmCreated, TYPE_PREDICATE, CHARM_CLASS);
        const charmVersion = addInteger(
          charmType,
          SCHEMA_VERSION_PREDICATE,
          version
        );
        const updatedTodoList = setThing(appConfig, charmVersion);
        const updatedDataset = await saveSolidDatasetAt(
          getSourceUrl(appConfig) as string,
          updatedTodoList,
          {
            fetch,
          }
        );
        console.log(updatedDataset);
      }}
    >
      <h1>Create a charm</h1>
      <label>
        Name
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </label>
      <label>
        Body
        <textarea onChange={(e) => setBody(e.target.value)} value={body} />
      </label>
      <button type="submit">Create</button>
    </form>
  );
};

export default CharmsCreate;
