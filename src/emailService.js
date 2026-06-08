import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_r082ed7";
const PUBLIC_KEY = "6m1ufd_mbp_KPAkA2";
const TEMPLATE_REGISTRO = "template_hg5f2k7";
const TEMPLATE_PEDIDO = "template_ay8twih";

export function enviarEmailRegistro(nombre, email) {
  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_REGISTRO,
    { nombre, email },
    PUBLIC_KEY,
  );
}

export function enviarEmailPedido(nombre, email, carrito) {
  const resumen = carrito
    .map(
      (p) =>
        `${p.title} x${p.cantidad} — ${(p.price * p.cantidad).toFixed(2)} €`,
    )
    .join("\n");

  const total = carrito
    .reduce((acc, p) => acc + p.price * p.cantidad, 0)
    .toFixed(2);

  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_PEDIDO,
    { nombre, email, resumen, total },
    PUBLIC_KEY,
  );
}
