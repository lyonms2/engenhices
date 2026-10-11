"use client";

/**
 * Reduz uma foto no navegador antes do envio: lado maior de até 1600 px, em
 * JPEG. Uma foto de celular de 5 MB costuma cair para 300–600 KB.
 *
 * Se o navegador não conseguir abrir o formato (ex.: HEIC fora do Safari),
 * devolve o arquivo original, e o servidor decide se o tamanho é aceitável.
 */
export async function comprimirImagem(
  arquivo: File,
  ladoMaximo = 1600,
  qualidade = 0.82,
): Promise<File> {
  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const contexto = canvas.getContext("2d");
    if (!contexto) return arquivo;
    contexto.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolver) =>
      canvas.toBlob(resolver, "image/jpeg", qualidade),
    );
    if (!blob || blob.size >= arquivo.size) return arquivo;

    const nome = arquivo.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nome, { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}
