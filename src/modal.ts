function makeDraggableModals() : void {
  var headers = document.querySelectorAll("#modals .modal-header");

  for (var i = 0; i < headers.length; i++) {
    var header = <HTMLDivElement> headers[i];
    var element = <HTMLDivElement> header.closest('.modal');

    if (element.getAttribute('draggable')) {
      continue;
    }

    makeDraggableModal(header, element);
  }
}

function makeDraggableModal(
  header: HTMLDivElement,
  element: HTMLDivElement
) : void {

  element.setAttribute('draggable', 'true');

  var dragX = 0;
  var dragY = 0;
  var elementX = 0;
  var elementY = 0;

  element.addEventListener('dragstart', function(e : DragEvent) {
    dragX = e.clientX;
    dragY = e.clientY;

    var rect = element.getBoundingClientRect();

    elementX = rect.left + (window.pageXOffset || document.documentElement.scrollLeft);
    elementY = rect.top + (window.pageYOffset || document.documentElement.scrollTop);
  });

  element.addEventListener('dragend', function(e : DragEvent) {
    element.style.transform = 'translate(0px, 0px)';
    element.style.position = 'absolute';
    element.style.left = (e.clientX - dragX + elementX) + 'px';
    element.style.top = (e.clientY - dragY + elementY) + 'px';
  });
}