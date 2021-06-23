import { SessionProvider } from "@inrupt/solid-ui-react";
import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AuthStatus from "./AuthStatus";
import CharmsCreate from "./Charms/Create";
import CharmsList from "./Charms/List";
import CharmsView from "./Charms/View";
import Home from "./Home";
import InitializeApp from "./InitializeApp";
import reportWebVitals from "./reportWebVitals";

export const APP_ID = "exalted:app:essence.ooo" as const;
export const CHARM_SCHEMA_VERSION = 0;

const Layout: FunctionComponent = () => (
  <SessionProvider sessionId={APP_ID}>
    <header>
      <h1>
        Oadenol's Codex{" "}
        <small style={{ fontVariant: "small-caps" }}>beta</small>
      </h1>
      <AuthStatus />
    </header>
    <main>
      <Outlet />
    </main>
  </SessionProvider>
);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<InitializeApp />}>
            <Route element={<Home />} />
            <Route path="charms" element={<CharmsList />} />
            <Route path="charms/create" element={<CharmsCreate />} />
            <Route path="charms/:id" element={<CharmsView />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
