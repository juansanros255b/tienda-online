import { useEffect, useRef, useState } from "react";
import "./App.css";
import Producto from "./Producto";
import Carrito from "./Carrito";
import DetalleProducto from "./DetalleProducto";
import Auth from "./Auth";
import { enviarEmailPedido } from "./emailService";

const LIMIT = 10;
const BASE_URL = "https://api.escuelajs.co/api/v1";

function App() {
  const [datos, setDatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null); // null = todas
  const [offset, setOffset] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [pedidoRealizado, setPedidoRealizado] = useState(false);
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });
  const centinela = useRef(null);

  // Cargar categorías al inicio (solo las 10 primeras)
  useEffect(() => {
    fetch(`${BASE_URL}/categories?limit=10&offset=0`)
      .then((res) => res.json())
      .then((data) => setCategorias(data));
  }, []);

  // Cargar productos cuando cambia offset o categoría
  useEffect(() => {
    setCargando(true);

    const url = categoriaActiva
      ? `${BASE_URL}/products/?categoryId=${categoriaActiva}&limit=${LIMIT}&offset=${offset}`
      : `${BASE_URL}/products?limit=${LIMIT}&offset=${offset}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.length < LIMIT) setHayMas(false);
        setDatos((prev) => [...prev, ...data]);
      })
      .finally(() => setCargando(false));
  }, [offset, categoriaActiva]);

  // UseEffect que guarda los productos en el carrito al recargar la página
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  // useEffect que observa el centinela
  useEffect(() => {
    if (!centinela.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const primero = entries[0];
        if (primero.isIntersecting && !cargando && hayMas) {
          setOffset((prev) => prev + LIMIT);
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(centinela.current);

    return () => observer.disconnect();
  }, [cargando, hayMas]);

  // Cambiar categoría: resetea todo
  function handleCategoria(id) {
    setCategoriaActiva(id);
    setDatos([]);
    setOffset(0);
    setHayMas(true);
  }

  function handleCargarMas() {
    setOffset((prev) => prev + LIMIT);
  }

  function handleAgregarCarrito(producto) {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        // Si ya está, aumenta la cantidad
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p,
        );
      }
      // Si no está, lo añade con cantidad 1
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }

  function handleFinalizar() {
    enviarEmailPedido(usuario.name, usuario.email, carrito).catch((err) =>
      console.error("Error enviando email:", err),
    );
    setPedidoRealizado(true);
  }

  function handleLogin(usuario, token) {
    setUsuario(usuario);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCarrito([]);
  }

  // Cambiar cantidad — si llega a 0 lo elimina
  function handleCambiarCantidad(id, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
      handleEliminar(id);
      return;
    }
    setCarrito((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: nuevaCantidad } : p)),
    );
  }

  // Eliminar producto del carrito
  function handleEliminar(id) {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      {!usuario ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <div id="barra-usuario">
          <span>👤 {usuario.name}</span>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      )}
      {pedidoRealizado ? (
        <div id="pedido-confirmado">
          <h2>✅ ¡Pedido realizado!</h2>
          <p>Gracias por tu compra. Tu pedido está en camino.</p>
          <button
            onClick={() => {
              setPedidoRealizado(false);
              setCarrito([]);
            }}
          >
            Volver a la tienda
          </button>
        </div>
      ) : productoSeleccionado ? (
        <DetalleProducto
          producto={productoSeleccionado}
          onVolver={() => setProductoSeleccionado(null)}
          onComprar={(prod) => {
            handleAgregarCarrito(prod);
            setProductoSeleccionado(null);
          }}
        />
      ) : (
        <>
          <Carrito
            carrito={carrito}
            onFinalizar={handleFinalizar}
            onCambiarCantidad={handleCambiarCantidad}
            onEliminar={handleEliminar}
          />

          <div id="categorias">
            <button
              onClick={() => handleCategoria(null)}
              className={categoriaActiva === null ? "activo" : ""}
            >
              Todas
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoria(cat.id)}
                className={categoriaActiva === cat.id ? "activo" : ""}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {datos.map((prod) => (
            <Producto
              key={prod.id}
              id={prod.id}
              title={prod.title}
              price={prod.price}
              image={prod.images[0]}
              onSeleccionar={() => setProductoSeleccionado(prod)}
              onAgregar={() =>
                handleAgregarCarrito({
                  id: prod.id,
                  title: prod.title,
                  price: prod.price,
                  image: prod.images[0],
                })
              }
            />
          ))}

          {/* Centinela invisible para el scroll infinito */}
          <div ref={centinela} style={{ height: "1px" }}></div>

          {cargando && <p id="mensaje-carga">⏳ Cargando productos...</p>}
          {!cargando && datos.length === 0 && (
            <p id="mensaje-vacio">No hay productos en esta categoría.</p>
          )}
          {!cargando && hayMas && datos.length > 0 && (
            <button id="btn-cargar-mas" onClick={handleCargarMas}>
              Cargar más
            </button>
          )}
          {!cargando && !hayMas && (
            <p id="mensaje-fin">✅ No hay más productos.</p>
          )}
        </>
      )}
    </>
  );
}

export default App;
