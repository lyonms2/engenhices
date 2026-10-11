/**
 * Configuração PÚBLICA do Firebase (SDK web).
 *
 * Estes valores identificam o projeto e não são segredos — a proteção real
 * vem das regras do Firestore/Storage e do Firebase Authentication. Mesmo
 * assim, ficam em variáveis de ambiente para não fixar um projeto no código.
 *
 * Nenhuma credencial de conta de serviço (Admin SDK) deve usar o prefixo
 * NEXT_PUBLIC_: esse prefixo envia o valor ao navegador.
 *
 * A inicialização fica em client.ts. Nenhuma página usa o Firebase ainda,
 * e o site funciona sem estas variáveis.
 */

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const completa = Object.values(config).every(
    (valor) => typeof valor === "string" && valor.length > 0,
  );

  return completa ? (config as FirebasePublicConfig) : null;
}

export function isFirebaseConfigured(): boolean {
  return getFirebasePublicConfig() !== null;
}
