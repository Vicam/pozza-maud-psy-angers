// Injects a simple navigation bar compatible with static hosting
(function () {
  if (document.getElementById('custom-nav')) return;

  // Inject CSS link next to this script
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  try {
    var curr = document.currentScript && document.currentScript.src ? document.currentScript.src : 'assets/nav.js';
    var base = curr.slice(0, curr.lastIndexOf('/') + 1);
    link.href = base + 'nav.css';
  } catch (e) {
    link.href = '/assets/nav.css';
  }
  document.head.appendChild(link);

  // Build nav structure
  var nav = document.createElement('nav');
  nav.id = 'custom-nav';
  var container = document.createElement('div');
  container.className = 'container';

  var ul = document.createElement('ul');

  function liLink(text, href, cls) {
    var li = document.createElement('li');
    if (cls) li.className = cls;
    var a = document.createElement('a');
    a.textContent = text;
    a.href = href;
    li.appendChild(a);
    return li;
  }

  // Items
  ul.appendChild(liLink('Accueil', '/', 'brand'));
  ul.appendChild(liLink('Prestations', '/prestations/'));

  var liPlus = document.createElement('li');
  liPlus.className = 'dropdown';
  var aPlus = document.createElement('a');
  aPlus.href = '#';
  aPlus.textContent = 'Plus';
  liPlus.appendChild(aPlus);
  var menu = document.createElement('div');
  menu.className = 'dropdown-menu';
  var aRemb = document.createElement('a');
  aRemb.textContent = 'Aides financieres';
  aRemb.href = '/rembousement/'; // keep current folder name
  var aBlog = document.createElement('a');
  aBlog.textContent = 'Blog';
  aBlog.href = '/blog/';
  menu.appendChild(aRemb);
  menu.appendChild(aBlog);
  liPlus.appendChild(menu);
  ul.appendChild(liPlus);

  container.appendChild(ul);
  nav.appendChild(container);

  // Insert nav at the very top of <body> to avoid clipping/overflow from PMPA containers
  document.body.insertBefore(nav, document.body.firstChild);

  // Prevent default navigation on the "Plus" toggle
  aPlus.addEventListener('click', function (e) { e.preventDefault(); });

  // Mark active link by path
  try {
    var path = (location.pathname || '/').toLowerCase();
    var links = nav.querySelectorAll('a[href]');
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      function norm(u){
        try { return new URL(u, location.origin).pathname.replace(/\\/+$/,'/'); } catch { return u; }
      }
      if (norm(path) === norm(href)) {
        var li = a.closest('li');
        if (li) li.classList.add('active');
      }
    });
  } catch (e) { /* no-op */ }
})();

