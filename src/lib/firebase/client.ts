import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirebasePublicConfig } from "./config";

/**
 * Instância única do app Firebase.
 *
 * Devolve null quando as variáveis de ambiente não estão definidas, para que
 * o site continue funcionando sem o Firebase (por exemplo, num build sem
 * .env.local). Os serviços (Firestore, Auth, Storage) são obtidos a partir
 * daqui, cada um no seu módulo, só quando forem usados.
 */
export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebasePublicConfig();
  if (!config) return null;

  return getApps().length > 0 ? getApp() : initializeApp(config);
}
