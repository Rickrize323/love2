// ===== MODAL DE IMÁGENES =====
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');

// Abrir modal al hacer click en una imagen
document.querySelectorAll('.card img').forEach(img => {
  img.addEventListener('click', () => {

    // Asignar src ANTES de mostrar el modal
    modalImg.src = img.src;

    // Mostrar modal
    modal.classList.remove('hidden');

    // Bloquear scroll vertical del body (no el carrusel)
    document.body.style.overflowY = 'hidden';
  });
});

// Función cerrar modal
function cerrarModal() {
  modal.classList.add('hidden');

  // Limpiar src para evitar imagen rota
  modalImg.src = '';

  // Restaurar scroll
  document.body.style.overflowY = 'auto';
}

// Cerrar al hacer click fuera de la imagen
modal.addEventListener('click', e => {
  if (e.target === modal) {
    cerrarModal();
  }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    cerrarModal();
  }
});
