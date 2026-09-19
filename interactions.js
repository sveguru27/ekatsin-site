// Единая точка правды для канала заявки (ссылка получена от Екатерины 17.09.2026).
window.SITE_CONFIG = {
  contactUrl: 'https://t.me/ekaterinasenotrusova'
};

document.querySelectorAll('[data-cta="contact"]').forEach(function (el) {
  el.setAttribute('href', window.SITE_CONFIG.contactUrl);
  el.setAttribute('target', '_blank');
  el.setAttribute('rel', 'noopener');
});

// Мягкая магнитная реакция главных CTA-кнопок на курсор.
// Не трогает остальные элементы страницы — единственный hover-приём на сайте.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;
  if (reduceMotion || !canHover) return;

  document.querySelectorAll('.btn.magnetic').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.35 + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'translate(0,0)';
    });
  });
})();

// Мобильное меню: клик по .burger переключает .nav-open на <header>.
(function () {
  var burger = document.querySelector('.burger');
  var header = document.querySelector('header');
  if (!burger || !header) return;

  burger.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
})();

// Кнопка «наверх»: появляется после прокрутки, плавно возвращает наверх.
(function () {
  var btn = document.querySelector('.to-top');
  if (!btn) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();

// Счётчики: числа плавно "накручиваются" при появлении на экране.
(function () {
  var counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }

    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { observer.observe(el); });
})();

// Форма обратной связи — честный визуальный макет: реальной отправки нет,
// клик по "Отправить" открывает готовое письмо в почтовом клиенте на реальный
// адрес Екатерины (mailto:), а не притворяется, что сообщение уже ушло.
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  var successBox = document.querySelector('.form-success');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('[name="name"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var message = form.querySelector('[name="message"]').value.trim();

    var subject = 'Заявка с сайта от ' + name;
    var body = 'Имя: ' + name + '\nEmail: ' + email + '\n\n' + message;
    var mailtoUrl = 'mailto:ekatsin71@yandex.ru'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);

    form.style.display = 'none';
    if (successBox) {
      var nameSpan = successBox.querySelector('.success-name');
      if (nameSpan) nameSpan.textContent = name;
      successBox.classList.add('visible');
    }

    window.setTimeout(function () {
      window.location.href = mailtoUrl;
    }, 500);
  });
})();

// Слайдер отзывов: один отзыв на экране, стрелки + точки-навигация.
// Один отзыв на странице просто показывается статично — слайдер не нужен.
(function () {
  var sliders = document.querySelectorAll('[data-slider]');
  if (!sliders.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sliders.forEach(function (slider) {
    var track = slider.querySelector('.testi-track');
    var slides = slider.querySelectorAll('.testi-slide');
    var dotsWrap = slider.querySelector('.testi-dots');
    var prevBtn = slider.querySelector('[data-dir="-1"]');
    var nextBtn = slider.querySelector('[data-dir="1"]');
    if (!track || !dotsWrap || !prevBtn || !nextBtn || slides.length < 2) return;

    if (reduceMotion) track.style.transition = 'none';

    var index = 0;
    var dots = [];

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testi-dot';
      dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function update() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
    }

    prevBtn.addEventListener('click', function () { goTo(index - 1); });
    nextBtn.addEventListener('click', function () { goTo(index + 1); });

    update();
  });
})();

// Длинные отзывы сворачиваются до ~5 строк, "Читать полностью" разворачивает.
// Текст никогда не обрезается по факту — только визуально, до клика.
(function () {
  document.querySelectorAll('.testi-slide').forEach(function (slide) {
    if (slide.scrollHeight <= 170) return;
    slide.classList.add('clamped');
    var btn = document.createElement('span');
    btn.className = 'testi-read-more';
    btn.textContent = 'Читать полностью';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var expanded = slide.classList.toggle('expanded');
      btn.textContent = expanded ? 'Свернуть' : 'Читать полностью';
    });
    slide.appendChild(btn);
  });
})();

// Плавное появление секций при прокрутке.
// Не на каждой секции подряд — только там, где это реальный акцент
// (фото-моменты, доказательства, финальные CTA), а не на плотных сетках
// карточек/списков — они помечены классом .no-reveal в разметке.
(function () {
  var sections = document.querySelectorAll('main > section:not(.no-reveal)');
  if (!sections.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    sections.forEach(function (el) { el.classList.add('reveal', 'is-visible'); });
    return;
  }

  sections.forEach(function (el) { el.classList.add('reveal'); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  sections.forEach(function (el) { observer.observe(el); });
})();
