/**
 * Recursively scan LPS tickets and LPE tickets, and replace any
 * plain text with HTML.
 */

var jiraTicketId = /([^/])(LP[EPS]-[0-9]+)/g;
var jiraTicketURL = /([^"])(https:\/\/issues\.liferay\.com\/browse\/)(LP[EPS]-[0-9]+)/g;

var jiraTicketIdLink = /<a [^>]*href="https:\/\/issues\.liferay\.com\/browse\/(LP[EPS]-[0-9]+)"[^>]*>\1<\/a>/g;
var jiraTicketURLLink = /<a [^>]*href="(https:\/\/issues\.liferay\.com\/browse\/)(LP[EPS]-[0-9]+)"[^>]*>\1\2<\/a>/g;

function addJiraLinksToElement(element: HTMLElement) : void {
  var newHTML = element.innerHTML.replace(jiraTicketIdLink, '$1');
  newHTML = element.innerHTML.replace(jiraTicketURLLink, '$1$2');

  if (element.contentEditable == 'true') {
    newHTML = newHTML.replace(jiraTicketId, '$1<a href="https://issues.liferay.com/browse/$2">$2</a>');
    newHTML = newHTML.replace(jiraTicketURL, '$1<a href="$2$3">$2$3</a>');
  }
  else {
    newHTML = newHTML.replace(jiraTicketId, '$1<a href="https://issues.liferay.com/browse/$2" target="_blank">$2</a>');
    newHTML = newHTML.replace(jiraTicketURL, '$1<a href="$2$3" target="_blank">$2$3</a>');
  }
  if (element.innerHTML != newHTML) {
    element.innerHTML = newHTML;
  }
}

/**
 * Adds a button which loads a window which allows you to compose a
 * post with Markdown.
 */

function addStackeditButton(
  element: HTMLElement,
  callback: Function
 ) : void {
      
  var img = document.createElement('img');
  img.title = 'Compose with Stackedit';
  img.classList.add('lesa-ui-stackedit-icon');
  img.src = 'https://benweet.github.io/stackedit.js/icon.svg';

  var listItem = document.createElement('li');
  listItem.appendChild(img);
  listItem.onclick = composeWithStackedit.bind(null, element, callback);

  var parentElement = <HTMLElement> element.parentElement;
  var grandparentElement = <HTMLElement> parentElement.parentElement;
  
  var list = <HTMLUListElement> grandparentElement.querySelector('.zendesk-editor--toolbar ul');
  list.appendChild(listItem);
}

/**
 * Adds an underline button to the regular formatter.
 */

function addUnderlineButton(element: HTMLElement) : void {
  var underlineSVGPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  underlineSVGPath.setAttribute('fill', 'currentColor');
  underlineSVGPath.setAttribute('d', 'M11 7.5c0 2.5-1.4 3.8-3.9 3.8-2.6 0-4.1-1.2-4.1-3.8V1.2h1.3v6.3c0 1.8 1 2.7 2.7 2.7 1.7 0 2.6-.9 2.6-2.7V1.2H11v6.3zm-9 5.3v-.7h10v.7H2z');

  var underlineButtonIconContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  underlineButtonIconContainer.setAttribute('viewBox', '0 0 14 14');
  underlineButtonIconContainer.appendChild(underlineSVGPath);

  var underlineButton = document.createElement('button');
  underlineButton.setAttribute('type', 'button');
  underlineButton.classList.add('zendesk-editor--item', 'underline');
  underlineButton.setAttribute('data-command-name', 'underline');
  underlineButton.setAttribute('aria-label', 'Underline');
  underlineButton.setAttribute('data-editor-tooltip', 'Underline (ctrl u)');
  underlineButton.setAttribute('aria-pressed', 'false');
  underlineButton.setAttribute('aria-disabled', 'false');

  underlineButton.appendChild(underlineButtonIconContainer);

  var underlineButtonText = document.createElement('span');
  underlineButtonText.textContent = ('Underline')
  underlineButtonText.classList.add('zendesk-editor--accessible-hidden-text');
  underlineButton.appendChild(underlineButtonText);

  underlineButton.addEventListener('click', function(e) {
    document.execCommand('underline', false, undefined);
  });

  underlineButton.onmousedown = function(e) {
    e.stopPropagation();
    return false;
  };

  var underlineButtonListItem = document.createElement('li');
  underlineButtonListItem.appendChild(underlineButton);

  var parentElement = <HTMLElement> element.parentElement;
  var grandparentElement = <HTMLElement> parentElement.parentElement;
  var formattingButtons = <HTMLElement> grandparentElement.querySelector('.zendesk-editor--text-commands .zendesk-editor--group')

  formattingButtons.appendChild(underlineButtonListItem);
}

/**
 * Add buttons which load windows that allow you to compose a post
 * with Markdown.
 */

function addStackeditButtons(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  if (conversation.classList.contains('lesa-ui-stackedit')) {
    return;
  }

  conversation.classList.add('lesa-ui-stackedit');

  var newComments = <Array<HTMLElement>> Array.from(conversation.querySelectorAll('.zendesk-editor--rich-text-container .zendesk-editor--rich-text-comment'));

  for (var i = 0; i < newComments.length; i++) {
    addUnderlineButton(newComments[i]);
    addStackeditButton(newComments[i], addJiraLinksToElement);
  }
}

/**
 * Allows you to compose a post with Markdown, even if we are still
 * configured to use Zendesk's WYSIWYG editor.
 */

var paragraphTag = /<(\/)?p>/g;

var turndownService = new TurndownService({
  codeBlockStyle: 'fenced'
});

function composeWithStackedit(
  element: HTMLElement,
  callback: Function
) : void {

  var stackedit = new Stackedit();

  var preElements = <Array<HTMLPreElement>> Array.from(element.querySelectorAll('pre'));

  for (var i = 0; i < preElements.length; i++) {
    preElements[i].setAttribute('style', '');
    preElements[i].innerHTML = preElements[i].innerHTML.replace(paragraphTag, '<$1code>');
  }

  stackedit.openFile({
    content: {
      text: turndownService.turndown(element.innerHTML)
    }
  });

  stackedit.on('fileChange', function(file: StackeditFile) {
    element.innerHTML = file.content.html;

    if (callback) {
      callback(element);
    }
  });
}

/**
 * Scan the ticket for LPS tickets and LPE tickets, and replace any
 * plain text with HTML.
 */

function addJiraLinks(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  if (conversation.classList.contains('lesa-ui-jiralink')) {
    return;
  }

  conversation.classList.add('lesa-ui-jiralink');

  var newComments = <Array<HTMLElement>> Array.from(conversation.querySelectorAll('.zendesk-editor--rich-text-container .zendesk-editor--rich-text-comment'));

  for (var i = 0; i < newComments.length; i++) {
    newComments[i].onblur = _.debounce(addJiraLinksToElement.bind(null, newComments[i]), 500);
  }

  var comments = <Array<HTMLDivElement>> Array.from(conversation.querySelectorAll('div[data-comment-id]'));

  for (var i = 0; i < comments.length; i++) {
    addJiraLinksToElement(comments[i]);
  }
}

/**
 * Add a playbook reminder to the given editor.
 */

function addPlaybookReminder(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  var editor = conversation.querySelector('.editor');

  if (!editor) {
    return;
  }

  var parentElement = <HTMLElement> editor.parentElement;
  var playbookReminderElement = parentElement.querySelector('.lesa-ui-playbook-reminder');

  if (playbookReminderElement) {
    if (ticketId == playbookReminderElement.getAttribute('data-ticket-id')) {
      return;
    }
  }
  else {
    playbookReminderElement = document.createElement('div');
    playbookReminderElement.setAttribute('data-ticket-id', ticketId);
    playbookReminderElement.classList.add('lesa-ui-playbook-reminder');
  }

  var reminders = [];

  var tags = (ticketInfo && ticketInfo.ticket && ticketInfo.ticket.tags) || [];
  var tagSet = new Set(tags);

  var subpriority = ticketInfo.ticket.priority || 'none';

  if (((subpriority == 'high') || (subpriority == 'urgent')) && tagSet.has('platinum')) {
    var criticalMarkers = ['production', 'production_completely_shutdown', 'production_severely_impacted_inoperable'].filter(Set.prototype.has.bind(tagSet));

    if (criticalMarkers.length >= 2) {
      reminders.push(['platinum critical', 'https://grow.liferay.com/people/How+To+Handle+Critical+Tickets', 'playbook']);
    }
  }

  playbookReminderElement.innerHTML = reminders.map(x => 'This is a <strong>' + x[0] + '</strong> ticket. Please remember to follow the <a href="' + x[1] + '">' + x[2] + '</a> !').join('<br/>');

  parentElement.insertBefore(playbookReminderElement, editor);
}