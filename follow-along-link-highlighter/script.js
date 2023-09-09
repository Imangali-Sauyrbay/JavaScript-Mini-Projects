const links = document.querySelectorAll('a');

const highlight = document.createElement('span');
highlight.classList.add('highlight');
document.body.appendChild(highlight);

class Rect {
  /** 
   * @param {number} w 
   * @param {number} h 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(w, h, x, y) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
  }
}

/**
 * @param {HTMlElement} element
 * @returns {Rect}
 */
function getBounds(element) {
  const { width, height, top, left } = element.getBoundingClientRect();
  return new Rect(width, height, top + window.scrollY, left + window.scrollX);
}

/**
 * 
 * @param {Rect} param0 
 * @returns {undefined}
 */
function changeHighlightStyle({ w, h, x, y }) {
  return highlight.style.cssText = `
  width: ${w}px;
  height: ${h}px;
  top: ${x}px;
  left: ${y}px;
`;
}

const key = 'highlightPlace';
const lastCoords = JSON.parse(localStorage.getItem(key));

if(lastCoords) {
  highlight.style.transition = 'none';
  changeHighlightStyle(lastCoords);
  highlight.style.transition = ''
}

function linkHandler(e) {
  const coords = getBounds(e.target);
  localStorage.setItem(key, JSON.stringify(coords));
  changeHighlightStyle(coords);
}

links.forEach(link => link.addEventListener('mouseenter', linkHandler));