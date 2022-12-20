const ajax = new XMLHttpRequest();
ajax.open('GET', './assets/img/SVG/sprite.svg', true);
ajax.send();
ajax.onload = function () {
  const div = document.createElement('div');
  div.className = 'svgSprite';
  div.innerHTML = ajax.responseText;
  document.body.insertBefore(div, document.body.childNodes[0]);
};
