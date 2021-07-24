import { CookiesProvider } from "react-cookie";
import Main from "./main";

export default function Root() {
  return (
    <CookiesProvider>
      <Main />
    </CookiesProvider>
  );
}
