import { LoginButton, LogoutButton, useSession } from "@inrupt/solid-ui-react";
import { Fragment, FunctionComponent } from "react";
import { APP_ID } from ".";

const AuthStatus: FunctionComponent = () => {
  const {
    session: {
      info: { isLoggedIn },
    },
  } = useSession();
  return (
    <Fragment>
      {isLoggedIn ? "logged in" : "not logged in"}{" "}
      {isLoggedIn ? (
        <LogoutButton />
      ) : (
        <LoginButton
          oidcIssuer={"https://broker.pod.inrupt.com"}
          redirectUrl={window.location.href}
          authOptions={{ clientName: APP_ID }}
        />
      )}
    </Fragment>
  );
};

export default AuthStatus;
