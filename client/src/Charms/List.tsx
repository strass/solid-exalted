import { getThingAll, getUrl } from "@inrupt/solid-client";
import { Table, TableColumn, useDataset } from "@inrupt/solid-ui-react";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import useSolidContext from "../context/Solid";
import {
  TYPE_PREDICATE,
  CHARM_CLASS,
  CREATED_PREDICATE,
  TEXT_PREDICATE,
  NAME_PREDICATE,
} from "./shape";

const CharmsList: FunctionComponent = () => {
  const { dataInstances } = useSolidContext();
  const { dataset: appConfig, error } = useDataset(dataInstances?.[0]);
  const appConfigThings = appConfig ? getThingAll(appConfig) : [];

  if (!appConfig) {
    console.warn("TODO: add spinner");
    return null;
  }

  if (error) {
    throw new Error(error);
  }

  const thingsArray = appConfigThings
    .filter((t) => getUrl(t, TYPE_PREDICATE) === CHARM_CLASS)
    .map((thing) => {
      return { dataset: appConfig, thing };
    });

  return (
    <div>
      <span>Your charms list has {thingsArray.length} items</span>
      <Table things={thingsArray}>
        <TableColumn property={NAME_PREDICATE} header="Name" />
        <TableColumn
          property={CREATED_PREDICATE}
          dataType="datetime"
          header="Created At"
          body={({ value }: { value: Date }) => value.toDateString()}
        />
        <TableColumn
          property={TEXT_PREDICATE}
          header=""
          body={({ value }: { value: string }) => value.substr(0, 120)}
        />
      </Table>
      <Link to="/charms/create">Create a charm</Link>
    </div>
  );
};

export default CharmsList;
