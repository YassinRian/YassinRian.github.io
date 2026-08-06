define([], function () {
  "use strict";

  /**
   * dom — Tiny hyperscript + htm helper (no build step).
   *
   * Usage:
   *   dom.html`<div class="card"><h1>${title}</h1></div>`
   *   dom.render(container, dom.html`<span>Hello</span>`)
   *
   * htm is loaded on first use from CDN (~500 bytes).
   * Falls back gracefully to innerHTML strings if htm unavailable.
   */
  var _htmReady = false;
  var _htmlFn = null;

  /**
   * Simple hyperscript: h('div', {class:'card'}, 'Hello', childNode)
   * Creates real DOM elements without any library.
   */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var key in attrs) {
        if (!attrs.hasOwnProperty(key)) continue;
        var val = attrs[key];
        if (key === "className") {
          el.className = val;
        } else if (key === "style" && typeof val === "object") {
          for (var sk in val) {
            if (val.hasOwnProperty(sk)) el.style[sk] = val[sk];
          }
        } else if (typeof key === "string" && key.slice(0, 2) === "on") {
          el.addEventListener(key.slice(2).toLowerCase(), val);
        } else {
          el.setAttribute(key, val);
        }
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      appendChild(el, arguments[i]);
    }
    return el;
  }

  function appendChild(parent, child) {
    if (child == null) return;
    if (typeof child === "string" || typeof child === "number" || typeof child === "boolean") {
      parent.appendChild(document.createTextNode(String(child)));
    } else if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++) appendChild(parent, child[i]);
    } else if (child instanceof Node) {
      parent.appendChild(child);
    }
  }

  /**
   * html — tagged template that returns DOM Nodes.
   * On first call, loads htm from CDN and binds to our h().
   */
  function html(strings) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) values.push(arguments[_i]);

    if (_htmlFn) return _htmlFn.apply(null, [strings].concat(values));

    // htm not yet loaded — try to load it synchronously via pre-fetched module
    // Fallback: build HTML string
    var result = strings[0];
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      if (Array.isArray(v)) v = v.join("");
      if (v instanceof Node) v = v.outerHTML || "[Node]";
      result += String(v != null ? v : "") + strings[i + 1];
    }
    var wrapper = document.createElement("div");
    wrapper.innerHTML = result;
    if (wrapper.children.length === 1) return wrapper.firstChild;
    // Multiple children: return fragment-like wrapper
    return wrapper;
  }

  /**
   * Initialize htm (async — call once early).
   * After this resolves, html`` returns real DOM nodes via htm.
   */
  async function initHtm() {
    if (_htmReady) return;
    try {
      var htmModule = await import("https://cdn.jsdelivr.net/npm/htm@3.1.1/+esm");
      // htm's default export is the bindable function
      var bindFn = htmModule.default || htmModule;
      _htmlFn = bindFn.bind(h);
      _htmReady = true;
      console.log("[dom] htm loaded — html`` now returns real DOM nodes");
    } catch (e) {
      console.warn("[dom] htm load failed, using innerHTML fallback:", e.message);
      _htmReady = true; // don't retry
    }
  }

  /**
   * Render DOM nodes into a container (clears existing content).
   */
  function render(container, child) {
    while (container.firstChild) container.removeChild(container.firstChild);
    if (child == null) return;
    if (typeof child === "string") {
      container.innerHTML = child;
    } else if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++) {
        if (child[i] instanceof Node) container.appendChild(child[i]);
      }
    } else if (child instanceof Node) {
      container.appendChild(child);
    } else {
      container.innerHTML = String(child);
    }
  }

  return {
    h: h,
    html: html,
    render: render,
    initHtm: initHtm
  };
});
