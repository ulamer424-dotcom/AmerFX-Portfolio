const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const backToTop = document.getElementById('backToTop');
const loader = document.querySelector('.page-loader');
const navLinks = document.querySelectorAll('.main-nav a');
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioGrid = document.getElementById('portfolioGrid');
const portfolioEmpty = document.getElementById('portfolioEmpty');
const videoModal = document.getElementById('videoModal');
const modalClose = document.getElementById('modalClose');
const modalVideo = document.getElementById('modalVideo');
const modalTitle = document.getElementById('modalTitle');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

const projects = Array.isArray(window.AMERFX_PROJECTS)
    ? window.AMERFX_PROJECTS
    : [];

window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('is-hidden'), 450);
});

function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 20);
    backToTop.classList.toggle('show', window.scrollY > 550);
}

window.addEventListener('scroll', updateHeader);
updateHeader();

menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    document.body.classList.toggle('menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        document.body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.14 });

function observeRevealElements(root = document) {
    root.querySelectorAll('.reveal:not(.visible)').forEach(element => {
        revealObserver.observe(element);
    });
}

observeRevealElements();

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.remove('active'));
        const current = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
        if (current) current.classList.add('active');
    });
}, { rootMargin: '-45% 0px -45% 0px' });

sections.forEach(section => sectionObserver.observe(section));

function categoryLabel(category) {
    const labels = {
        reels: '9:16 Reel',
        ads: 'Ad Video',
        motion: 'Motion'
    };
    return labels[category] || 'Video';
}

function createProjectCard(project, index) {
    const article = document.createElement('article');
    article.className = `project-card reveal${index % 3 === 1 ? ' delay-1' : index % 3 === 2 ? ' delay-2' : ''}`;
    article.dataset.category = project.category || 'reels';

    const thumb = document.createElement('div');
    thumb.className = 'project-thumb project-video-thumb';

    const preview = document.createElement('video');
    preview.className = 'project-preview-video';
    preview.src = project.video;
    preview.muted = true;
    preview.loop = true;
    preview.playsInline = true;
    preview.preload = 'metadata';
    if (project.cover) preview.poster = project.cover;

    const playButton = document.createElement('button');
    playButton.className = 'project-play';
    playButton.type = 'button';
    playButton.setAttribute('aria-label', `تشغيل ${project.title}`);
    playButton.textContent = '▶';

    const badge = document.createElement('span');
    badge.textContent = categoryLabel(project.category);

    thumb.append(preview, playButton, badge);

    const info = document.createElement('div');
    info.className = 'project-info';

    const title = document.createElement('h3');
    title.textContent = project.title;

    const description = document.createElement('p');
    description.textContent = project.description || 'مونتاج احترافي لفيديو قصير بمقاس 9:16';

    info.append(title, description);
    article.append(thumb, info);

    thumb.addEventListener('mouseenter', () => {
        preview.play().catch(() => {});
    });

    thumb.addEventListener('mouseleave', () => {
        preview.pause();
        preview.currentTime = 0;
    });

    thumb.addEventListener('click', () => openModal(project));
    return article;
}

function renderProjects(filter = 'all') {
    portfolioGrid.innerHTML = '';
    const visibleProjects = projects.filter(project => {
        return filter === 'all' || project.category === filter;
    });

    portfolioEmpty.hidden = visibleProjects.length > 0;

    visibleProjects.forEach((project, index) => {
        portfolioGrid.appendChild(createProjectCard(project, index));
    });

    observeRevealElements(portfolioGrid);
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderProjects(button.dataset.filter);
    });
});

function openModal(project) {
    // The preview cards stay muted so hover playback is allowed by browsers.
    // The modal opens after a real user click, so the full video can play with sound.
    modalVideo.pause();
    modalVideo.src = project.video;
    modalVideo.controls = true;
    modalVideo.muted = false;
    modalVideo.defaultMuted = false;
    modalVideo.volume = 1;
    modalVideo.currentTime = 0;

    if (project.cover) {
        modalVideo.poster = project.cover;
    } else {
        modalVideo.removeAttribute('poster');
    }

    modalTitle.textContent = project.title;
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    modalVideo.load();
    const playPromise = modalVideo.play();

    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Some browser settings may still block autoplay with sound.
            // Controls remain visible so one click on Play starts audio normally.
        });
    }
}

function closeModal() {
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
videoModal.addEventListener('click', event => {
    if (event.target === videoModal) closeModal();
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && videoModal.classList.contains('open')) {
        closeModal();
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

contactForm.addEventListener('submit', event => {
    event.preventDefault();
    formNote.textContent = 'تم استلام بياناتك داخل النموذج التجريبي. اربطه بخدمة بريد عند رفع الموقع.';
    contactForm.reset();
});

document.getElementById('year').textContent = new Date().getFullYear();
renderProjects();
