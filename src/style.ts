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

.lesa-ui-attachments,
.lesa-ui-knowledge-capture {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5em;
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
  border-top: 1px solid #eee;
  grid-column: 1 / 2 span;
  padding: 0.2em 0.5em;
  text-align: right;
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

.lesa-ui-event-highlighted {
  background-color: #eee;
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
  margin-bottom: 8px;
}

.lesa-ui-priority span {
  color: #fff;
  border-radius: 2px;
  margin-right: 8px;
  padding: 4px;
  text-align: center;
  text-transform: uppercase;
  width: 6em;
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

.rich_text .comment_input .lesa-ui-playbook-reminder {
  display: none;
}

.rich_text .comment_input.is-public .lesa-ui-playbook-reminder:not(:empty) {
  background-color: #eef2fa;
  border: 1px solid #d8dcde;
  border-radius: 0 3px 0 0 !important;
  color: #2e5aac;
  display: block;
  padding: 10px;
}

.rich_text .comment_input.is-public .lesa-ui-playbook-reminder a {
  text-decoration: underline;
}

#modals .modal-header {
  cursor: move;
}
`;
}

var head = <HTMLHeadElement> document.querySelector('head');
head.appendChild(styleElement);