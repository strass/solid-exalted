import {
  createContext,
  Fragment,
  FunctionComponent,
  ReactNode,
  useContext,
} from "react";

const SpinnerContext = createContext<ReactNode>(<span>loading...</span>);

const useSpinner = () => useContext(SpinnerContext);

const Spinner: FunctionComponent<{
  loading: boolean;
  spinner?: ReactNode;
}> = ({
  loading,
  // eslint-disable-next-line react-hooks/rules-of-hooks
  spinner = useSpinner(),
  children,
}) => {
  return loading ? (
    <Fragment>{spinner}</Fragment>
  ) : (
    <Fragment>{children}</Fragment>
  );
};

export default Spinner;
