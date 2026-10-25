(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    var theme = root.getAttribute('data-theme');
    return theme ? theme === 'dark' : systemTheme.matches;
  }

  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(isDark()));
    toggle.setAttribute('aria-label', 'Switch to ' + (isDark() ? 'light' : 'dark') + ' mode');
  }

  if (toggle) {
    toggle.hidden = false;
    updateToggle();
    toggle.addEventListener('click', function () {
      var theme = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('blog-theme', theme); } catch (error) {}
      updateToggle();
    });
    if (systemTheme.addEventListener) systemTheme.addEventListener('change', updateToggle);
  }

  document.querySelectorAll('.main-navigation a').forEach(function (link) {
    var currentPath = window.location.pathname.replace(/\/$/, '');
    var linkPath = link.pathname.replace(/\/$/, '');
    if (linkPath === currentPath) {
      link.setAttribute('aria-current', 'page');
    } else if (linkPath === '' && /^\/blog\/(\d{4}|page)\//.test(currentPath)) {
      link.setAttribute('aria-current', 'location');
    }
  });

  // Offer natural wrapping points in API names without changing their text.
  document.querySelectorAll('.entry-title').forEach(function (title) {
    var walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(function (node) {
      var parts = node.textContent.split(/([a-z0-9])(?=[A-Z])/);
      if (parts.length === 1) return;
      var fragment = document.createDocumentFragment();
      parts.forEach(function (part, index) {
        fragment.appendChild(document.createTextNode(part));
        if (index % 2 === 1) fragment.appendChild(document.createElement('wbr'));
      });
      node.parentNode.replaceChild(fragment, node);
    });
  });

  // Copy the code text, without line numbers or toolbar labels.
  document.querySelectorAll('figure.code').forEach(function (figure) {
    var code = figure.querySelector('td.code code, pre code');
    if (!code) return;
    var caption = figure.querySelector('figcaption');
    if (caption && !caption.textContent.trim()) caption.parentNode.removeChild(caption);
    var scroller = figure.querySelector('.highlight');
    if (scroller) {
      scroller.tabIndex = 0;
      scroller.setAttribute('role', 'region');
      scroller.setAttribute('aria-label', 'Scrollable code example');
    }
    var toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    var language = document.createElement('span');
    language.className = 'code-language';
    language.textContent = code.className.replace(/^language-/, '').trim();
    toolbar.appendChild(language);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.setAttribute('aria-live', 'polite');
      button.textContent = 'Copy';
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(code.textContent).then(function () {
          button.textContent = 'Copied!';
          window.setTimeout(function () { button.textContent = 'Copy'; }, 1800);
        }, function () {
          button.textContent = 'Select code to copy';
          window.setTimeout(function () { button.textContent = 'Copy'; }, 2500);
        });
      });
      toolbar.appendChild(button);
    }
    figure.insertBefore(toolbar, figure.firstChild);
  });

}());
