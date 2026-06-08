function Producto({ title, price, image, onAgregar, onSeleccionar }) {
  return (
    <div
      className="producto"
      onClick={onSeleccionar}
      style={{ cursor: "pointer" }}
    >
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{price} €</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAgregar();
        }}
      >
        🛒 Añadir al carrito
      </button>
    </div>
  );
}

export default Producto;
