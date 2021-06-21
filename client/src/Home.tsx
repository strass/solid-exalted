import { CombinedDataProvider, Text, useSession } from "@inrupt/solid-ui-react";
import { FunctionComponent } from "react";

const Home: FunctionComponent = () => {
  const {
    session: {
      info: { isLoggedIn, webId },
    },
  } = useSession();
  return isLoggedIn && webId ? (
    <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
      <span>You are logged in as: </span>
      <Text
        properties={[
          "http://xmlns.com/foaf/0.1/name",
          "http://www.w3.org/2006/vcard/ns#fn",
        ]}
      />
    </CombinedDataProvider>
  ) : null;
};

export default Home;
