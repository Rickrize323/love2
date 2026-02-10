document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const carousel = document.querySelector('.carousel');
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalText = document.getElementById('imageNote');
  const saveBtn = document.getElementById('saveNote');
  const closeBtn = document.querySelector('.close-btn');
  const body = document.body;
  
  // Variables
  let isModalOpen = false;
  let currentImageIndex = 0;
  let notes = JSON.parse(localStorage.getItem('imageNotes')) || {};
  let saveTimeout = null;
  let isProgrammaticScroll = false;
  
  // CONFIGURACIÓN DEL CARRUSEL INFINITO (Solución robusta)
  function setupInfiniteCarousel() {
    // Posicionar inicialmente en el medio del primer conjunto
    setTimeout(() => {
      if (carousel.scrollWidth > carousel.clientWidth) {
        const scrollPosition = carousel.scrollWidth / 4;
        carousel.scrollLeft = scrollPosition;
      }
    }, 100);
    
    // Manejar scroll infinito
    carousel.addEventListener('scroll', handleInfiniteScroll);
    
    // Hacer scroll suave
    carousel.style.scrollBehavior = 'smooth';
  }
  
  function handleInfiniteScroll() {
    if (isProgrammaticScroll) return;
    
    const scrollLeft = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;
    const scrollThreshold = 100;
    
    // Si estamos cerca del final del scroll
    if (scrollLeft > scrollWidth - clientWidth - scrollThreshold) {
      isProgrammaticScroll = true;
      
      // Saltar al principio del segundo conjunto
      carousel.style.scrollBehavior = 'auto';
      carousel.scrollLeft = (scrollWidth / 2) - clientWidth + scrollThreshold;
      
      setTimeout(() => {
        carousel.style.scrollBehavior = 'smooth';
        isProgrammaticScroll = false;
      }, 50);
    }
    // Si estamos cerca del inicio del scroll
    else if (scrollLeft < scrollThreshold) {
      isProgrammaticScroll = true;
      
      // Saltar al final del primer conjunto
      carousel.style.scrollBehavior = 'auto';
      carousel.scrollLeft = (scrollWidth / 2) - scrollThreshold;
      
      setTimeout(() => {
        carousel.style.scrollBehavior = 'smooth';
        isProgrammaticScroll = false;
      }, 50);
    }
  }
  
  // FUNCIONES DEL MODAL
  function openModal(imgElement, index) {
    currentImageIndex = index;
    modalImage.src = imgElement.src;
    modalImage.alt = imgElement.alt;
    
    // Cargar nota existente
    const noteKey = `image_${index % 14}`; // Solo 14 imágenes únicas
    const savedNote = notes[noteKey] || '';
    modalText.value = savedNote;
    
    // Aplicar estilo si tiene nota
    if (savedNote) {
      modalText.classList.add('has-note');
    } else {
      modalText.classList.remove('has-note');
    }
    
    // Mostrar modal
    modal.classList.add('active');
    body.classList.add('modal-open');
    isModalOpen = true;
    
    // Enfocar el textarea si hay contenido
    if (savedNote) {
      setTimeout(() => {
        modalText.focus();
        modalText.setSelectionRange(savedNote.length, savedNote.length);
      }, 100);
    }
  }
  
  function closeModal() {
    // Guardar antes de cerrar
    saveNote();
    
    modal.classList.remove('active');
    body.classList.remove('modal-open');
    isModalOpen = false;
    
    // Limpiar timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  }
  
  function saveNote() {
    const noteKey = `image_${currentImageIndex % 14}`;
    const noteText = modalText.value.trim();
    
    if (noteText) {
      notes[noteKey] = noteText;
      localStorage.setItem('imageNotes', JSON.stringify(notes));
      
      // Actualizar badge visual en todas las tarjetas correspondientes
      updateNoteBadges(noteKey, true);
      
      // Feedback visual
      showSaveFeedback('✓ Guardada');
      modalText.classList.add('has-note');
    } else {
      // Si está vacío, eliminar
      delete notes[noteKey];
      localStorage.setItem('imageNotes', JSON.stringify(notes));
      
      // Actualizar badge visual
      updateNoteBadges(noteKey, false);
      
      modalText.classList.remove('has-note');
    }
  }
  
  function showSaveFeedback(message) {
    const originalText = saveBtn.textContent;
    
    saveBtn.textContent = message;
    saveBtn.style.background = '#10b981';
    saveBtn.disabled = true;
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = '';
      saveBtn.disabled = false;
    }, 1500);
  }
  
  function updateNoteBadges(imageKey, hasNote) {
    // imageKey tiene formato "image_0" a "image_13"
    const index = parseInt(imageKey.split('_')[1]);
    
    // Actualizar en ambos sets de tarjetas
    document.querySelectorAll('.card').forEach((card, cardIndex) => {
      // Las primeras 14 tarjetas son el primer set, las siguientes 14 son el segundo set
      if (cardIndex % 14 === index) {
        let badge = card.querySelector('.note-badge');
        
        if (hasNote && !badge) {
          // Crear badge
          badge = document.createElement('div');
          badge.className = 'note-badge';
          badge.textContent = '📝';
          card.appendChild(badge);
        } else if (!hasNote && badge) {
          // Eliminar badge
          badge.remove();
        }
      }
    });
  }
  
  // Auto-guardar con debounce
  modalText.addEventListener('input', function() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(() => {
      saveNote();
    }, 2000);
  });
  
  // CONFIGURAR EVENTOS EN LAS TARJETAS
  document.querySelectorAll('.card').forEach((card, index) => {
    // Click para abrir modal
    card.addEventListener('click', function() {
      const img = this.querySelector('img');
      openModal(img, index);
    });
    
    // Efecto de presión táctil
    card.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.95)';
    });
    
    card.addEventListener('touchend', function() {
      this.style.transform = '';
    });
    
    // Agregar badge si ya tiene nota
    const noteKey = `image_${index % 14}`;
    if (notes[noteKey]) {
      const badge = document.createElement('div');
      badge.className = 'note-badge';
      badge.textContent = '📝';
      card.appendChild(badge);
    }
  });
  
  // EVENTOS DEL MODAL
  closeBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', saveNote);
  
  // Cerrar con Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });
  
  // Cerrar al hacer clic fuera
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // INICIALIZAR
  setupInfiniteCarousel();
});
