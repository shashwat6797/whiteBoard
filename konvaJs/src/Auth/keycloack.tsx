import Keycloak from "keycloak-js";
import { useAtom } from "jotai";
type options = {
  url: string;
  realm: string;
  clientId: string;
};

const initOptions: options = {
  url: "http://localhost:8080/",
  realm: "whiteboardRealm",
  clientId: "whiteboardClient",
};

const keycloak = new Keycloak(initOptions);

export var profile;

export const Auth = async () => {
  var init = false;

  if (!keycloak.onReady) {
    try {
      const authenticated = await keycloak.init({
        onLoad: "login-required",
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      });
      init = true;
      keycloak.onAuthSuccess = () => console.log("Authenticated");
      profile = await keycloak.loadUserProfile();
      console.log(
        `User is ${authenticated} ? "authenticated" : "not authenticated"}`,
      );
    } catch (error) {
      console.error("Failed to inilitialize adapter : ", error);
    }
  }
};

export function Logout(): void {
  var logoutOptions = {
    redirectUri: `${window.location.origin}/`,
  };

  keycloak
    .logout(logoutOptions)
    .then((success) => {
      console.log("--> log: logout success ", success);
    })
    .catch((error) => {
      console.log("--> log: logout error ", error);
    });
}
