/**
 * Recursively scan LPS tickets and LPE tickets, and replace any
 * plain text with HTML.
 */

var jiraTicketId = /([^/])(LP[EPS]-[0-9]+)/g;
var jiraTicketLink = /<a [^>]*href="https:\/\/issues.liferay.com\/browse\/(LP[EPS]-[0-9]+)"[^>]*>[^<]*<\/a>/g;

function addJiraLinksToElement(element: HTMLElement) : void {
  var newHTML = element.innerHTML.replace(jiraTicketLink, '$1');

  if (element.contentEditable == 'true') {
    newHTML = newHTML.replace(jiraTicketId, '$1<a href="https://issues.liferay.com/browse/$2">$2</a>');
  }
  else {
    newHTML = newHTML.replace(jiraTicketId, '$1<a href="https://issues.liferay.com/browse/$2" target="_blank">$2</a>');
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
    return;
  }

  playbookReminderElement = document.createElement('div');
  playbookReminderElement.classList.add('lesa-ui-playbook-reminder');

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