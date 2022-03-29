var styleElement = <HTMLStyleElement> document.createElement('style');

if (window.location.hostname == '24475.apps.zdusercontent.com') {
  styleElement.textContent = `
body {
  overflow-y: hidden;
}
`;
}
else {
  styleElement.textContent = `
a.downloading {
  color: #999;
}

a.downloading::after {
  content: ' (downloading...)';
  color: #999;
}

a.generating {
  color: #999;
}

a.generating::after {
  content: ' (generating...)';
  color: #999;
}

article {
  border-top: 1px solid #ebebeb;
}

div.lesa-ui-subtitle {
  display: flex;
  flex-direction: column;
}

.lesa-ui-attachments,
.lesa-ui-knowledge-capture {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5em;
}

#attachments-modal .lesa-ui-attachments,
#description-modal .lesa-ui-description {
  margin: 0.5em;
}

#attachments-modal,
#description-modal {
  height: 60vh;
  width: 50vw;
}

#description-modal .event {
  border-top: 0px;
}

.lesa-ui-attachment-info {
  display: grid;
  grid-gap: 0em 1em;
  grid-template-columns: 1em auto;
  margin: 0.5em;
}

.lesa-ui-attachment-info input {
  margin-left: 0.5em;
}

.lesa-ui-attachment-info .lesa-ui-attachment-extra-info {
  grid-column: 1 / 2 span;
  padding: 0.2em 0.5em;
  text-align: right;
}

.lesa-ui-description .lesa-ui-attachment-info .lesa-ui-attachment-extra-info {
  border-top: 1px solid #eee;
}

.lesa-ui-attachment-info a {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesa-ui-attachments-bulk-download {
  margin-top: 0.5em;
  text-align: right;
  text-decoration: underline;
}

.lesa-ui-attachments-label,
.lesa-ui-knowledge-capture-label {
  font-weight: 600;
  margin-right: 1em;
  white-space: nowrap;
}

.lesa-ui-knowledge-capture-label:not(:first-child) {
  margin-top: 1em;
}

.lesa-ui-knowledge-capture ul {
  margin-left: 1em;
}

.lesa-ui-description {
  font-weight: normal;
}

.lesa-ui-description > div {
  margin-bottom: 2em;
}

.lesa-ui-description .zd-comment,
.lesa-ui-description .lesa-ui-attachment-info {
  max-height: 25em;
  overflow-y: auto;
}

.lesa-ui-event-highlighted,
article.lesa-ui-event-highlighted {
  background-color: #eee;
  scroll-margin-top: 1em;
}

.lesa-ui-form-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5em;
}

.lesa-ui-permalink {
  margin-bottom: 1em;
}

.lesa-ui-permalink > input,
.lesa-ui-form-field.lesa-ui-helpcenter > input {
  background-color: transparent;
  border: 0px;
  font-size: 12px;
  margin: 0px;
  padding: 0px;
  width: 100%;
}

.lesa-ui-stackedit-icon {
  height: 16px;
  width: 16px;
  padding: 4px;
}

.mast .editable .lesa-ui-subject {
  background-color: #fff;
  font-size: 20px;
  font-weight: 600;
  resize: vertical;
  text-align: left;
  width: 100%;
}

.header.mast > .round-avatar {
  display: none;
}

.lesa-ui-priority:not(:empty) {
  margin-top: 6px;
  margin-bottom: 8px;
}

.lesa-ui-priority span {
  color: #fff;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  margin-right: 8px;
  padding: 2px;
  text-align: center;
  text-transform: uppercase;
  width: 6em;
}

.lesa-ui-priority a {
  color: #fff;
  text-decoration: none;
}

.lesa-ui-priority > *:last-child {
  margin-right: 0;
}

.lesa-ui-priority .lesa-ui-subject-emojis a {
  color: #000;
}

.lesa-ui-subpriority {
  border: 1px #eee dashed;
  font-size: 0.8em;
}

.lesa-ui-priority-minor,
.lesa-ui-subpriority-none,
.lesa-ui-subpriority-low {
  background-color: #0066cc;
}

.lesa-ui-priority-major,
.lesa-ui-subpriority-medium {
  background-color: #f2783b;
}

.lesa-ui-priority-critical,
.lesa-ui-subpriority-high {
  background-color: #bf1e2d;
}

.lesa-ui-priority .lesa-ui-subject-emojis {
  background-color: #f8f9f9;
}

.lesa-ui-subject-emojis a {
  font-size: 1.5em;
  font-weight: normal;
  margin-left: 2px;
  margin-right: 2px;
}

.rich_text .comment_input .lesa-ui-playbook-reminder,
#editor-view .lesa-ui-playbook-reminder {
  display: none;
}

.rich_text .comment_input.is-public .lesa-ui-playbook-reminder:not(:empty),
#editor-view .lesa-ui-playbook-reminder:not(:empty) {
  background-color: #eef2fa;
  border: 1px solid #d8dcde;
  border-radius: 0 3px 0 0 !important;
  color: #2e5aac;
  display: block;
  margin-bottom: 1em;
  padding: 10px;
}

.rich_text .comment_input.is-public .lesa-ui-playbook-reminder a,
#editor-view .lesa-ui-playbook-reminder a {
  text-decoration: underline;
}

#modals .modal-header,
#attachments-modal .modal-header {
  cursor: move;
}

.fNgWaW {
  padding: 2px 0px;
  height: 14px;
  width: 1px;
  background: rgb(194, 200, 204);
  display: flex;
  margin: 0px 8px;
}

button[data-test-id="omnilog-jump-button"] {
  display: none;
}

div.omni-conversation-pane[data-ticket-id] div[data-test-id="editor-view"] {
  display: none;
}
`;
}

var head = <HTMLHeadElement> document.querySelector('head');
head.appendChild(styleElement);