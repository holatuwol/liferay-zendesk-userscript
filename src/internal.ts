function isInternalTicket(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : boolean {

  if (conversation.querySelectorAll('article').length == conversation.querySelectorAll('article div[data-test-id="omni-log-internal-note-tag"]').length) {
    return true;
  }

  return false;
}

function switchToInternalNotes(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  if (!isInternalTicket(ticketId, ticketInfo, conversation)) {
    return;
  }

  var editor = conversation.querySelector('div[data-test-id="editor-view"]');

  if (!editor || editor.classList.contains('lesa-ui-channel')) {
    return;
  }

  editor.classList.add('lesa-ui-channel');

  var button = <HTMLButtonElement | null> editor.querySelector('button[data-test-id="omnichannel-channel-switcher-button"][data-channel="web"]');

  if (!button) {
    return;
  }

  button.click();

  clickReactElement('[data-test-id="omnichannel-channel-switcher-menuitem-internal"]');
}