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
  margin-bottom: 0.5em;
}

.lesa-ui-attachment-info .lesa-ui-attachment-extra-info:not(:first-child) {
  margin-top: 1em;
  border-top: 1px solid lightgray;
  padding-top: 0.5em;
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
  grid-column: span 2;
}

.sidebar_box_container .lesa-ui-form-field {
  margin-bottom: 0.5em;
}

.lesa-ui-permalink {
  margin-bottom: 1em;
}

.lesa-ui-orgnotes {
  color: darkgreen;
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

span[data-garden-container-id="containers.tooltip"] {
  display: inline-flex;
  align-items: center;
  column-gap: 4px;
}

.lesa-ui-heat-score,
.lesa-ui-priority span {
  color: #fff;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}

.lesa-ui-priority span:not(.lesa-ui-offering) {
  text-transform: uppercase;
}

.lesa-ui-heat-score {
  padding: 0px 4px;
  line-height: 1.6;
}

.lesa-ui-priority span {
  line-height: 16px;
  margin-right: 8px;
  padding: 0.5em;
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

.lesa-ui-offering {
  background-color: #222;
}

.lesa-ui-quickwin {
  background-color: #037f52;
}

tr.quickwin {
  background-color: #eef8f4;
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

.lesa-ui-subject-emojis-container {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}


.lesa-ui-subject-emojis {
  background-color: #f8f9f9;
  margin-right: 0.5em;
  font-size: 1rem;
}

.lesa-ui-subject-emojis a {
  font-size: 1.5em;
  font-weight: normal;
  margin-left: 2px;
  margin-right: 2px;
}

.rich_text .comment_input .lesa-ui-playbook-reminder,
div[data-test-id="editor-view"] .lesa-ui-playbook-reminder {
  display: none;
}

.rich_text .comment_input.is-public .lesa-ui-playbook-reminder:not(:empty),
div[data-test-id="editor-view"] .lesa-ui-playbook-reminder:not(:empty) {
  background-color: #eef2fa;
  border: 1px solid #d8dcde;
  border-radius: 0 3px 0 0 !important;
  color: #2e5aac;
  display: block;
  margin-bottom: 1em;
  padding: 10px;
}

.rich_text .comment_input.is-public .lesa-ui-playbook-reminder a,
div[data-test-id="editor-view"] .lesa-ui-playbook-reminder a {
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

.tags span a {
  color: rgb(73, 84, 92);
  font-weight: normal;
}

.tags span.important-tag a {
  color: rebeccapurple;
  font-weight: 600;
}

.lesa-ui-group-rows-summary {
  width: fit-content;
}

td[data-test-id="ticket-table-cells-subject"] .lesa-ui-tags {
  display: flex;
  flex-wrap: wrap;
}

td[data-test-id="ticket-table-cells-subject"] .lesa-ui-tags span {
  background: rgb(233, 235, 237);
  border-radius: 0.2em;
  color: rgb(73, 84, 92);
  font-size: x-small;
  margin: 0.2em 0.2em;
  padding-left: 0.3em;
  padding-right: 0.3em;
}

td[data-test-id="generic-table-cells-id"] span.lesa-ui-tags {
  background: rgb(233, 235, 237);
  border-radius: 0.2em;
  color: rgb(73, 84, 92);
  font-size: x-small;
  margin: 0.2em 0.2em;
  padding-left: 0.3em;
  padding-right: 0.3em;
}

div[data-cy-test-id="status-badge-state"] {
  width: 4em;
}

div[data-test-id="ticket_table_tooltip-header-ticket-info"] > * > div[data-cy-test-id="status-badge-state"],
div[data-test-id="header-tab-tooltip"] > * > * > div[data-cy-test-id="status-badge-state"],
div[data-cy-test-id="submit_button-menu"] > * > * > div[data-cy-test-id="status-badge-state"] {
  width: auto;
}

[type="internal"] {
  transition: max-height 0.3s ease, padding 0.3s ease;
  overflow: hidden;
  max-height: 100%;
}
  
[type="internal"].collapsed {
  max-height: 0 !important;
  padding: 0 !important;
  opacity: 0;
  pointer-events: none;
}

[data-test-id="header-tablist"][data-visible-tabs="0"] #close-all-tabs-btn,
[data-test-id="header-tablist"][data-visible-tabs="1"] #close-all-tabs-btn {
  display: none
}
`
;
}

var head = <HTMLHeadElement> document.querySelector('head');
head.appendChild(styleElement);