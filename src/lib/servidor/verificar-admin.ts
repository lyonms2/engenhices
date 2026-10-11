import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Confere, no servidor, se a requisição vem do administrador: valida o token
 * de ID do Firebase (enviado como "Authorization: Bearer <token>") contra as
 * chaves públicas do Google e compara o UID com ADMIN_UID.
 *
 * Não precisa de conta de serviço: o token é um JWT assinado pelo Google.
 */

const CHAVES_DO_GOOGLE = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export async function verificarAdmin(request: Request): Promise<boolean> {
  const adminUid = process.env.ADMIN_UID;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!adminUid || !projectId) return false;

  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, CHAVES_DO_GOOGLE, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });
    return payload.sub === adminUid;
  } catch {
    return false;
  }
}
