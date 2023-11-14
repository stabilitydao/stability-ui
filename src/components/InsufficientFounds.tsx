export default function InsufficientFounds() {
  // Crear el elemento de cartel
  const cartel = document.createElement("div");
  cartel.innerHTML = "<p>¡Hola! Este es mi cartel.</p>";

  // Establecer estilos del cartel
  cartel.style.backgroundColor = "#3498db";
  cartel.style.color = "#fff";
  cartel.style.padding = "20px";
  cartel.style.textAlign = "center";
  cartel.style.borderRadius = "5px";

  // Agregar botón de cierre al cartel
  const cerrarBoton = document.createElement("button");
  cerrarBoton.textContent = "Cerrar";
  cerrarBoton.addEventListener("click", function () {
    document.body.removeChild(cartel);
  });
  cartel.appendChild(cerrarBoton);

  // Agregar el cartel al cuerpo del documento
  document.body.appendChild(cartel);
}
