import { CombinedDataProvider, Text, useSession } from "@inrupt/solid-ui-react";
import { Fragment, FunctionComponent } from "react";
import { Link } from "react-router-dom";

const Home: FunctionComponent = () => {
  const {
    session: {
      info: { isLoggedIn, webId },
    },
  } = useSession();
  return isLoggedIn && webId ? (
    <Fragment>
      <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
        <span>You are logged in as: </span>
        <Text
          properties={[
            "http://xmlns.com/foaf/0.1/name",
            "http://www.w3.org/2006/vcard/ns#fn",
          ]}
        />
      </CombinedDataProvider>
      <br />
      <Link to="/charms">Charms List</Link>
    </Fragment>
  ) : null;
};

export default Home;
