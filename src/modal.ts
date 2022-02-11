function addHeaderLinkModal(
  modalId: string,
  linkText: string,
  header: HTMLElement,
  content: HTMLDivElement,
) : void {

    var modal = document.createElement('div');
    modal.setAttribute('id', modalId);
    modal.classList.add('modal', 'modal-resizable', 'in', 'hide');

    var iframe = document.createElement('div');
    iframe.classList.add('iframe_app_view_wrapper')

    var modalHeader = document.createElement('header');
    modalHeader.classList.add('modal-header');

    var closeLink = document.createElement('a');
    closeLink.classList.add('close');

    closeLink.textContent = '\u00d7';
    closeLink.onclick = function() {
      modal.classList.add('hide');
    }

    modalHeader.appendChild(closeLink);

    var headerText = document.createElement('h3');
    headerText.textContent = linkText;

    modalHeader.appendChild(headerText);

    iframe.appendChild(modalHeader);

    content.classList.add('modal-body', 'app_view_wrapper', 'app_view', 'apps_modal');

    iframe.appendChild(content);

    modal.appendChild(iframe);

    header.after(modal);

    var openLink = document.createElement('a');
    openLink.textContent = linkText;
    openLink.onclick = function() {
      modal.classList.remove('hide');
    }

    var dividers = header.querySelectorAll('div[class^="Divider"]');
    var divider = <HTMLElement> dividers[dividers.length - 1];

    divider.after(openLink);
    openLink.after(divider.cloneNode());
}

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

    elementX = rect.left + (unsafeWindow.pageXOffset || document.documentElement.scrollLeft);
    elementY = rect.top + (unsafeWindow.pageYOffset || document.documentElement.scrollTop);
  });

  element.addEventListener('dragend', function(e : DragEvent) {
    element.style.transform = 'translate(0px, 0px)';
    element.style.position = 'absolute';
    element.style.left = (e.clientX - dragX + elementX) + 'px';
    element.style.top = (e.clientY - dragY + elementY) + 'px';
  });
}