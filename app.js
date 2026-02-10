document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.querySelector('.carousel');
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalText = document.getElementById('imageNote');
  const saveBtn = document.getElementById('saveNote');
  const closeBtn = document.querySelector('.close-btn');
  const cards = document.querySelectorAll('.card');
  const body = document.body;
  
  let isModalOpen = false;
  let currentImageIndex = 0;
  let notes = JSON.parse(localStorage.getItem('imageNotes')) || {};
  
  // Configurar carrusel infinito y centrado
  function setupInfiniteScroll() {
    setTimeout(() => {
      carousel.scrollLeft = (carousel.scrollWidth - carousel.clientWidth) / 4;
    }, 100);
    
    carousel.addEventListener('scroll', function() {
      const scrollLeft = carousel.scrollLeft;
      const scrollWidth = carousel.scrollWidth;
      const clientWidth = carousel.clientWidth;
      const scrollThreshold = 100;
      
      if (scrollLeft > scrollWidth - clientWidth - scrollThreshold) {
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft = scrollThreshold;
        setTimeout(() => {
          carousel.style.scrollBehavior = 'smooth';
        }, 50);
      } else if (scrollLeft < scrollThreshold) {
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft = scrollWidth - clientWidth - scrollThreshold;
        setTimeout(() => {
          carousel.style.scrollBehavior = 'smooth';
        }, 50);
      }
    });
    
    carousel.style.scrollBehavior = 'smooth';
  }
  
  // Abrir modal
  function openModal(imageSrc, alt, index) {
    currentImageIndex = index;
    
    const img = new Image();
    img.onload = () => {
      modalImage.src = imageSrc;
      modalImage.alt = alt;
      
      const imageKey = `image_${index}`;
      const savedNote = notes[imageKey] || '';
      modalText.value = savedNote;
      
      // Mostrar si ya tiene descripción guardada
      if (savedNote) {
        modalText.classList.add('has-note');
      } else {
        modalText.classList.remove('has-note');
      }
      
      modal.classList.add('active');
      body.classList.add('modal-open');
      isModalOpen = true;
      
      if (savedNote) {
        setTimeout(() => {
          modalText.focus();
          modalText.selectionStart = modalText.selectionEnd = savedNote.length;
        }, 100);
      }
    };
    img.src = imageSrc;
  }
  
  // Cerrar modal
  function closeModal() {
    // Auto-guardar antes de cerrar
    saveNote();
    
    modal.classList.remove('active');
    body.classList.remove('modal-open');
    isModalOpen = false;
    
    setTimeout(() => {
      carousel.style.scrollBehavior = 'smooth';
    }, 100);
  }
  
  // Guardar descripción
  function saveNote() {
    const imageKey = `image_${currentImageIndex}`;
    const noteText = modalText.value.trim();
    
    if (noteText) {
      notes[imageKey] = noteText;
      localStorage.setItem('imageNotes', JSON.stringify(notes));
      
      // Feedback visual
      modalText.classList.add('has-note');
      showSaveFeedback('✓ Descripción guardada');
    } else {
      // Si está vacío, eliminar del almacenamiento
      delete notes[imageKey];
      localStorage.setItem('imageNotes', JSON.stringify(notes));
      modalText.classList.remove('has-note');
    }
  }
  
  // Mostrar feedback de guardado
  function showSaveFeedback(message) {
    const originalText = saveBtn.textContent;
    const originalBg = saveBtn.style.background;
    
    saveBtn.textContent = message;
    saveBtn.style.background = '#10b981';
    saveBtn.disabled = true;
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = originalBg;
      saveBtn.disabled = false;
    }, 1500);
  }
  
  // Auto-guardar cada 2 segundos si hay cambios
  let saveTimeout;
  modalText.addEventListener('input', function() {
    // Limpiar timeout anterior
    clearTimeout(saveTimeout);
    
    // Establecer nuevo timeout
    saveTimeout = setTimeout(() => {
      saveNote();
    }, 2000);
  });
  
  // Configurar eventos
  cards.forEach((card, index) => {
    card.addEventListener('click', function(e) {
      const img = this.querySelector('img');
      openModal(img.src, img.alt, index);
    });
    
    // Mostrar indicador visual si tiene descripción guardada
    const imageKey = `image_${index}`;
    if (notes[imageKey]) {
      const indicator = document.createElement('div');
      indicator.className = 'note-badge';
      indicator.innerHTML = '📝';
      indicator.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        z-index: 1;
      `;
      card.style.position = 'relative';
      card.appendChild(indicator);
    }
  });
  
  // Eventos del modal
  closeBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', saveNote);
  
  // Cerrar con Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });
  
  // Cerrar haciendo clic fuera
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Inicializar
  setupInfiniteScroll();
});

