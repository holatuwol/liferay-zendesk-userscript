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

function addReplyStackeditButton(
  element: HTMLElement,
  callback: Function
 ) : void {

  var parentElement = <HTMLElement> element.parentElement;
  var grandparentElement = <HTMLElement> parentElement.parentElement;
  var list = <HTMLUListElement> grandparentElement.querySelector('.zendesk-editor--toolbar ul');

  if (list.querySelector('.lesa-ui-stackedit-icon')) {
    return;
  }

  var img = document.createElement('img');
  img.title = 'Compose with Stackedit';
  img.classList.add('lesa-ui-stackedit-icon');
  img.src = 'https://benweet.github.io/stackedit.js/icon.svg';

  var listItem = document.createElement('li');
  listItem.appendChild(img);
  listItem.onclick = composeWithStackedit.bind(null, element, callback);

  list.appendChild(listItem);
}

/**
 * Adds an underline button to the regular formatter.
 */

function addReplyUnderlineButton(element: HTMLElement) : void {
  var parentElement = <HTMLElement> element.parentElement;
  var grandparentElement = <HTMLElement> parentElement.parentElement;
  var formattingButtons = <HTMLElement> grandparentElement.querySelector('.zendesk-editor--text-commands .zendesk-editor--group')

  if (formattingButtons.querySelector('.underline')) {
    return;
  }

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

  formattingButtons.appendChild(underlineButtonListItem);
}

/**
 * Add buttons which load windows that allow you to compose a post
 * with Markdown.
 */

function addReplyFormattingButtons(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  if (conversation.classList.contains('lesa-ui-stackedit')) {
    return;
  }

  conversation.classList.add('lesa-ui-stackedit');

  var legacyComments = <Array<HTMLElement>> Array.from(conversation.querySelectorAll('.zendesk-editor--rich-text-container .zendesk-editor--rich-text-comment'));

  for (var i = 0; i < legacyComments.length; i++) {
    addReplyUnderlineButton(legacyComments[i]);
    addReplyStackeditButton(legacyComments[i], addJiraLinksToElement);
  }

  var workspaceComments = <Array<HTMLElement>> Array.from(conversation.querySelectorAll('div[data-test-id="editor-view"]'));

  for (var i = 0; i < workspaceComments.length; i++) {
    shrinkReplyEditor(conversation, workspaceComments[i]);
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

  var comments = <Array<HTMLDivElement>> Array.from(conversation.querySelectorAll(isAgentWorkspace ? 'article' : 'div[data-comment-id]'));

  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i].querySelector('div[data-test-id="omni-log-message-content"]');
    if (comment) {
      addJiraLinksToElement(<HTMLDivElement> comment);
    }
  }
}

/**
 * Add a playbook reminder to the given editor.
 */

var reminderLinks = <Record<string, string>> {
  'platinum critical': '<a href="https://liferay.atlassian.net/wiki/spaces/SUPPORT/pages/2093908830/How+To+Handle+Critical+Tickets" target="_blank">playbook</a>',
  'premium critical': '<a href="https://liferay.atlassian.net/wiki/spaces/LXC/pages/2156265703/LXC+Global+Critical+Ticket+Workflow" target="_blank">workflow</a>',
};

function addPlaybookReminder(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  var editor = conversation.querySelector(isAgentWorkspace ? 'div[data-test-id="omnicomposer-rich-text-ckeditor"]' : '.editor');

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

  var markerText = getCriticalMarkerText(ticketInfo, tagSet);

  if ((markerText != null) && (markerText in reminderLinks)) {
    reminders.push([markerText, reminderLinks[markerText]]);
  }

  playbookReminderElement.innerHTML = reminders.map(x => 'This is a <strong>' + x[0] + '</strong> ticket. Please remember to follow the ' + x[1] + '!').join('<br/>');

  parentElement.insertBefore(playbookReminderElement, editor);
}

/**
 * Shrinks the reply editor.
 */

function shrinkReplyEditor(
  conversation: HTMLElement,
  element: HTMLElement
) : void {

  var interval = setInterval(
    function() {
      if (!element.style.flexBasis) {
        return;
      }

      var editor = element.querySelector('div[data-test-id="ticket-rich-text-editor"]');

      if (!editor) {
        return;
      }

      if (!editor.textContent) {
        element.style.flexBasis = '10%';
      }

      clearInterval(interval);
    },
    1000
  );
};