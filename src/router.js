const routes = {
  '/': 'home',
  '/register': 'register',
  '/login': 'login',
};

function navigateTo(url) {
  history.pushState(null, null, url);
  loadPage();
}

function loadPage() {
  const path = window.location.pathname;
  const page = routes[path] || 'home'; // Default para home se a rota não existir

  import(`./pages/${page}/index.js`)
    .then((module) => {
      document.getElementById('site').innerHTML = module.default();
    })
    .catch((err) => {
      console.error('Erro ao carregar a página:', err);
      document.getElementById('site').innerHTML =
        `<h1>Erro 404 - Página não encontrada</h1>`; //TODO Adicionar rota da Pagina de error
    });
}

// Escuta mudanças na navegação do usuário
window.addEventListener('popstate', loadPage);

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
  loadPage();

  document.body.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      navigateTo(e.target.getAttribute('href'));
    }
  });
});

export { navigateTo };
