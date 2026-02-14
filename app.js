document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalText = document.getElementById('imageNote');
  const saveBtn = document.getElementById('saveNote');
  const closeBtn = document.querySelector('.close-btn');
  const body = document.body;
  
  let isModalOpen = false;
  let currentImageKey = '';
  let notes = JSON.parse(localStorage.getItem('imageNotes')) || {};
  let saveTimeout = null;
  
  // CONFIGURAR TODOS LOS CARRUSELES
  document.querySelectorAll('.carousel').forEach((carousel, carouselIndex) => {
    // Scroll infinito
    setupInfiniteCarousel(carousel);
    
    // Configurar imágenes
    setupCarouselImages(carousel, carouselIndex);
    
    // Posición inicial
    setTimeout(() => {
      if (carousel.scrollWidth > carousel.clientWidth) {
        carousel.scrollLeft = carousel.scrollWidth / 4;
      }
    }, 100);
  });
  
  function setupInfiniteCarousel(carousel) {
    let isProgrammaticScroll = false;
    
    carousel.addEventListener('scroll', function() {
      if (isProgrammaticScroll) return;
      
      const scrollLeft = carousel.scrollLeft;
      const scrollWidth = carousel.scrollWidth;
      const clientWidth = carousel.clientWidth;
      const scrollThreshold = 100;
      
      if (scrollLeft > scrollWidth - clientWidth - scrollThreshold) {
        isProgrammaticScroll = true;
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft = (scrollWidth / 2) - clientWidth + scrollThreshold;
        
        setTimeout(() => {
          carousel.style.scrollBehavior = 'smooth';
          isProgrammaticScroll = false;
        }, 50);
      } else if (scrollLeft < scrollThreshold) {
        isProgrammaticScroll = true;
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft = (scrollWidth / 2) - scrollThreshold;
        
        setTimeout(() => {
          carousel.style.scrollBehavior = 'smooth';
          isProgrammaticScroll = false;
        }, 50);
      }
    });
    
    carousel.style.scrollBehavior = 'smooth';
  }
  
  function setupCarouselImages(carousel, carouselIndex) {
    const cards = carousel.querySelectorAll('.card');
    
    cards.forEach((card, cardIndex) => {
      const imageIndex = cardIndex % 14;
      const imageKey = `carousel${carouselIndex}_image${imageIndex}`;
      
      // Click para abrir modal
      card.addEventListener('click', function() {
        const img = this.querySelector('img');
        openModal(img.src, img.alt, imageKey);
      });
      
      // Efecto táctil
      card.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
      });
      
      card.addEventListener('touchend', function() {
        this.style.transform = '';
      });
      
      // Agregar badge si tiene nota
      if (notes[imageKey]) {
        addNoteBadge(card);
      }
    });
  }
  
  function addNoteBadge(card) {
    if (!card.querySelector('.note-badge')) {
      const badge = document.createElement('div');
      badge.className = 'note-badge';
      badge.textContent = '📝';
      card.appendChild(badge);
    }
  }
  
  function removeNoteBadge(card) {
    const badge = card.querySelector('.note-badge');
    if (badge) {
      badge.remove();
    }
  }
  
  function openModal(imageSrc, alt, imageKey) {
    currentImageKey = imageKey;
    modalImage.src = imageSrc;
    modalImage.alt = alt;
    
    const savedNote = notes[imageKey] || '';
    modalText.value = savedNote;
    
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
        modalText.setSelectionRange(savedNote.length, savedNote.length);
      }, 100);
    }
  }
  
  function closeModal() {
    saveNote();
    modal.classList.remove('active');
    body.classList.remove('modal-open');
    isModalOpen = false;
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  }
  
  function saveNote() {
    const noteText = modalText.value.trim();
    
    if (noteText) {
      notes[currentImageKey] = noteText;
      localStorage.setItem('imageNotes', JSON.stringify(notes));
      
      // Actualizar badge en todas las tarjetas con esta key
      updateNoteBadge(currentImageKey, true);
      showSaveFeedback('✓ Guardada');
      modalText.classList.add('has-note');
    } else {
      delete notes[currentImageKey];
      localStorage.setItem('imageNotes', JSON.stringify(notes));
      
      updateNoteBadge(currentImageKey, false);
      modalText.classList.remove('has-note');
    }
  }
  
  function updateNoteBadge(imageKey, hasNote) {
    const [_, carouselStr, imageStr] = imageKey.split(/(carousel\d+)_(image\d+)/);
    const carouselIndex = parseInt(carouselStr.replace('carousel', ''));
    const imageIndex = parseInt(imageStr.replace('image', ''));
    
    const carousels = document.querySelectorAll('.carousel');
    const carousel = carousels[carouselIndex];
    
    if (carousel) {
      const cards = carousel.querySelectorAll('.card');
      
      cards.forEach((card, cardIndex) => {
        if (cardIndex % 14 === imageIndex) {
          if (hasNote) {
            addNoteBadge(card);
          } else {
            removeNoteBadge(card);
          }
        }
      });
    }
  }
  
  function showSaveFeedback(message) {
    const originalText = saveBtn.textContent;
    saveBtn.textContent = message;
    saveBtn.style.background = '#10b981';
    saveBtn.disabled = true;
    
    setTimeout(() => {
      saveBtn.textContent = 'Guardar Descripción';
      saveBtn.style.background = '';
      saveBtn.disabled = false;
    }, 1500);
  }
  
  modalText.addEventListener('input', function() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNote, 2000);
  });
  
  closeBtn.addEventListener('click', closeModal);
  saveBtn.addEventListener('click', saveNote);
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
});
