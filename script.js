/* ═══════════════════════════════════════════════════════════
   YTMONETIZATION — Production Script
═══════════════════════════════════════════════════════════ */

'use strict';

// ─── NAVBAR SCROLL ───────────────────────────────────────
const navbar = document.getElementById('navbar');
const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
};
window.addEventListener('scroll', onScroll, { passive: true });

// ─── HAMBURGER MENU ──────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── CUSTOM CURSOR ───────────────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

const animateFollower = () => {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top  = followerY + 'px';
  requestAnimationFrame(animateFollower);
};
animateFollower();

document.querySelectorAll('a, button, .service-card, .feature-card, .price-card, .faq-question').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); follower.classList.add('hovering'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); follower.classList.remove('hovering'); });
});

// ─── PARTICLE CANVAS ─────────────────────────────────────
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');

const resize = () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
};
resize();
window.addEventListener('resize', resize, { passive: true });

const PARTICLE_COUNT = 80;
const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.5 + 0.5,
  dx: (Math.random() - 0.5) * 0.4,
  dy: (Math.random() - 0.5) * 0.4,
  opacity: Math.random() * 0.5 + 0.1,
}));

const drawParticles = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,65,108,${p.opacity})`;
    ctx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  // draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,65,108,${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
};
drawParticles();

// ─── COUNTER ANIMATION ───────────────────────────────────
const counters = document.querySelectorAll('.stat-number[data-target]');
let countersStarted = false;

const animateCounters = () => {
  if (countersStarted) return;
  countersStarted = true;
  counters.forEach(counter => {
    const target   = +counter.dataset.target;
    const duration = 2000;
    const step     = target / (duration / 16);
    let current    = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = target >= 1000
        ? Math.floor(current).toLocaleString('en-IN')
        : Math.floor(current);
    }, 16);
  });
};

// ─── INTERSECTION OBSERVER (AOS + counters) ──────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

// Counter trigger on hero stats section
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) animateCounters();
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
}

// ─── PRICING TABS ────────────────────────────────────────
const tabs     = document.querySelectorAll('.pricing-tab');
const allGrids = document.querySelectorAll('.pricing-grid');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const platform = tab.dataset.platform;
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    allGrids.forEach(grid => {
      const show = grid.id === `${platform}-plans`;
      grid.classList.toggle('hidden', !show);
      if (show) {
        // re-trigger AOS for newly visible cards
        grid.querySelectorAll('[data-aos]').forEach(el => {
          el.classList.remove('aos-animate');
          setTimeout(() => el.classList.add('aos-animate'), 50);
        });
      }
    });
  });
});

// ─── FAQ ACCORDION ───────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ─── SMOOTH SCROLL ───────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── ACTIVE NAV LINK ─────────────────────────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

const highlightNav = () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? '#fff' : '';
  });
};
window.addEventListener('scroll', highlightNav, { passive: true });

// ─── PARALLAX HERO ───────────────────────────────────────
const heroOrbs = document.querySelectorAll('.hero-orb');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  heroOrbs.forEach((orb, i) => {
    orb.style.transform = `translateY(${y * (0.1 + i * 0.05)}px)`;
  });
}, { passive: true });

// ─── TILT EFFECT ON SERVICE/PRICE CARDS ──────────────────
const tiltCards = document.querySelectorAll('.service-card, .price-card, .feature-card');

tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(1000px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── WHATSAPP FLOAT ANIMATION PAUSE ON HOVER ─────────────
const waFloat = document.querySelector('.whatsapp-float');
if (waFloat) {
  waFloat.addEventListener('mouseenter', () => waFloat.style.animationPlayState = 'paused');
  waFloat.addEventListener('mouseleave', () => waFloat.style.animationPlayState = 'running');
}

// ─── TYPEWRITER EFFECT (HERO BADGE) ──────────────────────
// subtle shimmer on trust items
const trustItems = document.querySelectorAll('.trust-item');
trustItems.forEach((item, i) => {
  setTimeout(() => {
    item.style.transition = 'color 0.3s, opacity 0.3s';
  }, i * 100);
});

// ─── PRICING CARD HOVER RIPPLE ───────────────────────────
document.querySelectorAll('.price-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;left:${e.clientX-rect.left}px;top:${e.clientY-rect.top}px;
      width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.25);
      transform:translate(-50%,-50%);animation:ripple 0.6s ease-out forwards;pointer-events:none;
    `;
    btn.style.position = 'relative'; btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// inject ripple keyframe
const style = document.createElement('style');
style.textContent = `@keyframes ripple{to{width:200px;height:200px;opacity:0}}`;
document.head.appendChild(style);

// ─── INITIAL AOS TRIGGER ─────────────────────────────────
// Trigger for elements already in viewport on load
setTimeout(() => {
  document.querySelectorAll('[data-aos]').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) el.classList.add('aos-animate');
  });
}, 100);

console.log('%cYTMonetization ✓ Loaded', 'color:#FF416C;font-weight:bold;font-size:14px;');
