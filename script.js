const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Menu mobile: controles e foco acompanham o estado visual.
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileNav.classList.toggle('is-open', open);
  mobileNav.inert = !open;
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', (event) => {
  if (!mobileNav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 981px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

// Carrossel discreto; pausa quando a aba não está visível ou o movimento é reduzido.
const slides = [...document.querySelectorAll('.hero-img')];
const heroIndex = document.querySelector('.hero-index');
let currentSlide = 0;
let carouselTimer;
function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle('is-active', position === currentSlide));
  heroIndex.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
}
function startCarousel() {
  clearInterval(carouselTimer);
  if (!reduceMotion.matches && !document.hidden) carouselTimer = setInterval(() => showSlide(currentSlide + 1), 6500);
}
document.querySelector('.hero-prev').addEventListener('click', () => { showSlide(currentSlide - 1); startCarousel(); });
document.querySelector('.hero-next').addEventListener('click', () => { showSlide(currentSlide + 1); startCarousel(); });
document.addEventListener('visibilitychange', startCarousel);
reduceMotion.addEventListener('change', startCarousel);
startCarousel();

// Conteúdo permanece visível sem JavaScript e para quem prefere menos movimento.
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -35px 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  reduceMotion.addEventListener('change', (event) => {
    if (event.matches) {
      observer.disconnect();
      document.body.classList.remove('motion-ready');
    }
  });
}

// Visualização ampliada da galeria, com navegação por teclado.
const galleryItems = [...document.querySelectorAll('.gallery-item')];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('p');
const lightboxCount = lightbox.querySelector('.lightbox-count');
let currentGallery = 0;
function renderLightbox(index) {
  currentGallery = (index + galleryItems.length) % galleryItems.length;
  const image = galleryItems[currentGallery].querySelector('img');
  lightboxImage.src = image.src.replace(/w=900/, 'w=1400');
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.alt;
  lightboxCount.textContent = `${currentGallery + 1} / ${galleryItems.length}`;
}
galleryItems.forEach((item, index) => item.addEventListener('click', () => {
  renderLightbox(index);
  lightbox.showModal();
  lightbox.querySelector('.lightbox-close').focus();
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => renderLightbox(currentGallery - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => renderLightbox(currentGallery + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') renderLightbox(currentGallery - 1);
  if (event.key === 'ArrowRight') renderLightbox(currentGallery + 1);
});

// Substitua pelo número real do estúdio antes da publicação (país + DDD + número).
// O número de zeros é intencionalmente inválido para não encaminhar dados a terceiros.
const WHATSAPP_NUMBER = '5500000000000';
const form = document.querySelector('#form-pedido');
const message = document.querySelector('#f-msg');
const fallbackLink = document.querySelector('#wa-fallback');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = form.elements.nome.value.trim();
  const contact = form.elements.contato.value.trim();
  const place = form.elements.local.value.trim();
  const idea = form.elements.ideia.value.trim();
  const contactDigits = contact.replace(/\D/g, '');
  if (!name || contactDigits.length < 10 || idea.length < 10) {
    message.textContent = 'Informe seu nome, um contato válido e descreva a ideia com pelo menos 10 caracteres.';
    fallbackLink.hidden = true;
    return;
  }
  const text = [
    'Olá, TRISTERO! Gostaria de conversar sobre uma tatuagem.',
    '',
    `Nome: ${name}`,
    `Contato para retorno: ${contact}`,
    `Região do corpo: ${place || 'A definir'}`,
    `Ideia: ${idea}`,
  ].join('\n');
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  fallbackLink.href = url;
  fallbackLink.hidden = false;
  message.textContent = 'Abrindo o WhatsApp com a mensagem pronta. Revise antes de enviar.';
  window.open(url, '_blank', 'noopener,noreferrer');
});
form.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('input', () => {
  fallbackLink.hidden = true;
  message.textContent = '';
}));

// Se uma fotografia externa falhar, o bloco mantém um fundo coerente.
document.querySelectorAll('img').forEach((image) => {
  function onError() {
    image.classList.add('is-missing');
    if (image.classList.contains('hero-img') && image.classList.contains('is-active')) showSlide(currentSlide + 1);
    const galleryButton = image.closest('.gallery-item');
    if (galleryButton) {
      galleryButton.disabled = true;
      galleryButton.setAttribute('aria-label', 'Fotografia indisponível');
      galleryButton.querySelector('span').textContent = 'Imagem indisponível';
    }
  }
  image.addEventListener('error', onError);
  if (image.complete && image.naturalWidth === 0) onError();
});
