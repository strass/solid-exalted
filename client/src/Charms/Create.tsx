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
import { useNavigate } from "react-router-dom";
import { CHARM_SCHEMA_VERSION } from "..";
import Spinner from "../components/Spinner";
import useSolidContext from "../context/Solid";
import {
  CHARM_CLASS,
  CREATED_PREDICATE,
  NAME_PREDICATE,
  SCHEMA_VERSION_PREDICATE,
  TEXT_PREDICATE,
  TYPE_PREDICATE,
} from "./shape";

const CharmsCreate: FunctionComponent = () => {
  const { dataInstances } = useSolidContext();
  const navigate = useNavigate();
  const { fetch } = useSession();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const version = CHARM_SCHEMA_VERSION;

  const { dataset: appConfig, error } = useDataset(dataInstances?.[0]);
  if (error) {
    throw new Error(error);
  }

  if (!appConfig) {
    return <Spinner loading />;
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
        const charmName = addStringNoLocale(charmText, NAME_PREDICATE, name);
        const charmCreated = addDatetime(
          charmName,
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
        navigate("/charms");
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
      <br />
      <label>
        Body
        <textarea onChange={(e) => setBody(e.target.value)} value={body} />
      </label>
      <button type="submit">Create</button>
    </form>
  );
};

export default CharmsCreate;
