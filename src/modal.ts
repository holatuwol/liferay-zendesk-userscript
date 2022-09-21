function createModal(
  modalId: string,
  linkText: string,
  header: HTMLElement,
  conversation: HTMLElement,
  callback: Function,
) : void {

  var modal = document.createElement('div');
  modal.setAttribute('id', modalId);
  modal.classList.add('modal', 'modal-resizable', 'in');

  var iframe = document.createElement('div');
  iframe.classList.add('iframe_app_view_wrapper')

  var modalHeader = document.createElement('header');
  modalHeader.classList.add('modal-header');

  var closeLink = document.createElement('a');
  closeLink.classList.add('close');

  closeLink.textContent = '\u00d7';
  closeLink.onclick = function() {
    modal.remove();
  }

  modalHeader.appendChild(closeLink);

  var headerText = document.createElement('h3');
  headerText.textContent = linkText;

  modalHeader.appendChild(headerText);

  iframe.appendChild(modalHeader);

  modal.appendChild(iframe);

  header.after(modal);

  var contentWrapper = document.createElement('div');
  contentWrapper.classList.add('modal-body', 'app_view_wrapper');

  var content = callback();

  content.classList.add('app_view', 'apps_modal');

  contentWrapper.appendChild(content);

  iframe.appendChild(contentWrapper);
}

function addHeaderLinkModal(
  modalId: string,
  linkText: string,
  header: HTMLElement,
  conversation: HTMLElement,
  callback: Function,
) : void {

  var openLink = document.createElement('a');
  openLink.textContent = linkText;
  openLink.onclick = createModal.bind(null, modalId, linkText, header, conversation, callback);

  var viaLabel = <HTMLDivElement> conversation.querySelector('div[data-test-id="omni-header-via-label"]');

  var divider = document.createElement('div');
  divider.classList.add('Divider-sc-2k6bz0-9', 'fNgWaW', 'lesa-ui-modal-header-link');

  viaLabel.before(divider);
  divider.before(openLink);
}

function makeDraggableModals() : void {
  var headers = document.querySelectorAll(".modal-header");

  for (var i = 0; i < headers.length; i++) {
    var header = <HTMLDivElement> headers[i];
    var element = <HTMLDivElement> header.closest('.modal');

    if (element.getAttribute('draggable')) {
      continue;
    }

    makeDraggableModal(header, element);
  }
}

function moveModal(
  element: HTMLDivElement,
  dragEvent : DragEvent,
  dropEvent : DragEvent
) : void {

  var rect = element.getBoundingClientRect();
  var elementX = rect.left + (unsafeWindow.pageXOffset || document.documentElement.scrollLeft);
  var elementY = rect.top + (unsafeWindow.pageYOffset || document.documentElement.scrollTop);

  element.style.transform = 'translate(0px, 0px)';
  element.style.left = (dropEvent.clientX - dragEvent.clientX + elementX) + 'px';
  element.style.top = (dropEvent.clientY - dragEvent.clientY + elementY) + 'px';
}

function makeDraggableModal(
  header: HTMLDivElement,
  element: HTMLDivElement
) : void {

  element.setAttribute('draggable', 'true');

  var dragEvent = <DragEvent | null> null;

  element.addEventListener('dragstart', function(e : DragEvent) {
    dragEvent = e;
  });

  element.addEventListener('dragend', function(e : DragEvent) {
  	moveModal(element, <DragEvent> dragEvent, e);
  });
}