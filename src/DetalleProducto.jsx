function DetalleProducto({ producto, onVolver, onComprar }) {
  if (!producto) return null;

  return (
    <div id="detalle">
      <button onClick={onVolver}>← Volver</button>

      <div id="detalle-contenido">
        {/* Imágenes */}
        <div id="detalle-imagenes">
          {producto.images.map((img, i) => (
            <img key={i} src={img} alt={`${producto.title} ${i + 1}`} />
          ))}
        </div>

        {/* Info */}
        <div id="detalle-info">
          <h2>{producto.title}</h2>
          <p id="detalle-precio">{producto.price} €</p>
          <p id="detalle-descripcion">{producto.description}</p>
          <p id="detalle-categoria">
            Categoría: <strong>{producto.category.name}</strong>
          </p>
          <p id="detalle-id">Ref: #{producto.id}</p>

          <button id="btn-comprar" onClick={() => onComprar(producto)}>
            🛒 Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleProducto;
