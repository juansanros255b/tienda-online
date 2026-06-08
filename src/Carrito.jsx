import { useState } from "react";

function Carrito({ carrito, onFinalizar, onCambiarCantidad, onEliminar }) {
  const [abierto, setAbierto] = useState(false);
  const total = carrito.reduce((acc, p) => acc + p.price * p.cantidad, 0);
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  if (abierto) {
    return (
      <div id="carrito">
        <button onClick={() => setAbierto(false)}>← Seguir comprando</button>
        <h2>🛒 Carrito</h2>

        {carrito.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          <>
            {carrito.map((p) => (
              <div key={p.id} className="carrito-item">
                <img src={p.image} alt={p.title} width={50} />
                <span className="carrito-item-nombre">{p.title}</span>

                {/* Controles de cantidad */}
                <div className="carrito-item-controles">
                  <button
                    onClick={() => onCambiarCantidad(p.id, p.cantidad - 1)}
                  >
                    −
                  </button>
                  <span>{p.cantidad}</span>
                  <button
                    onClick={() => onCambiarCantidad(p.id, p.cantidad + 1)}
                  >
                    +
                  </button>
                </div>

                <span className="carrito-item-precio">
                  {(p.price * p.cantidad).toFixed(2)} €
                </span>

                {/* Botón eliminar */}
                <button
                  className="carrito-item-eliminar"
                  onClick={() => onEliminar(p.id)}
                >
                  🗑️
                </button>
              </div>
            ))}

            <p id="carrito-total">
              <strong>Total: {total.toFixed(2)} €</strong>
            </p>
            <button id="btn-finalizar" onClick={onFinalizar}>
              ✅ Finalizar pedido
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <button id="btn-carrito" onClick={() => setAbierto(true)}>
      🛒 Carrito ({totalItems})
    </button>
  );
}

export default Carrito;
