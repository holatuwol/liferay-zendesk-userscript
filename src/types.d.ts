type AccountMetadata = {
  account: {name: string}
}

type AttachmentLinkMetadata = {
  element: HTMLAnchorElement
  text: string
  href: string
  download: string
  commentId: string
  author: string
  time: string
  timestamp: string
  missingCorsHeader: boolean
}

declare function cloneInto(gmObject: any, window: Window) : any;
declare function exportFunction(gmFunction: any, window: Window) : any;
declare var unsafeWindow : globals | Window;

interface GM {
  xmlHttpRequest: Function
}

declare var GM : GM;

type JiraTicket = {
  subject: string
  createdAt: string
  assignee: {
    group: {
      name: string
    }
  }
  conversation: Array<{value: string}>
}

interface JSZip {
  (): JSZip;
  new(config?: Object): this;
  file(fileName: string, blob: Blob): void;
  generateAsync(config?: Object): Promise<Blob>;
}

declare var JSZip : JSZip;

type OrganizationMetadata = {
  external_id: string;
  notes?: string;
  organization_fields: {
    account_code: string;
    account_key: string;
    country: string;
    sla: string;
    support_region: string;
  }
  tags: string[];
}

interface Stackedit {
  (): Stackedit;
  new(config?: Object): this;
  openFile(config: Object): void;
  on(event: string, callback: (file: StackeditFile) => void): void;
}

declare var Stackedit : Stackedit;

type StackeditFile = {
  content: {
    html: string
  }
}

type TicketAuditEvent = {
  events: Array<{body: {article: {title: string, html_url: string}}, type: string}>
}

type TicketMetadata = {
  audits?: Array<TicketAuditEvent>
  ticket: {
    id: number
    custom_fields: Array<{id: number; value: string | null}>
    priority: string | null
    raw_subject: string
    requester_id: number
    status: string
    tags: Array<string> | null
  };
  organizations: Array<OrganizationMetadata>;
}

interface TinyMCEDomQuery {
  nextUntil(until?: string) : TinyMCEDomQuery;
  wrapAll(content: string | HTMLElement) : TinyMCEDomQuery;
}

interface TinyMCE {
  (): TinyMCE;
  new(config?: Object): this;
  activeEditor: {
    contentDocument: Document;
    focus(): void;
    formatter: {
      register(name: string, config: Object): void;
      toggle(name: string): void;
    };
    on(eventName: string, callback: (event) => void): void;
    selection: {
      getNode(): HTMLElement;
    }
  };
  dom: {
    DomQuery(element: HTMLElement) : TinyMCEDomQuery;
  };
  DOM: {
    toggleClass(element: HTMLElement, className: string): void
  }
}

declare var tinymce : TinyMCE;

interface TinyMCENodeChangeEvent {
  element: {
    nodeName: string
  }
}

interface TurndownService {
  (): TurndownService;
  new(config?: Object): this;
  turndown(s: string) : string;
}

declare var TurndownService : TurndownService;

type ZendeskClient = {
  init: () => ZendeskClientInstance;
}

declare var ZAFClient: ZendeskClient | null;

type ZendeskClientInstance = {
  get: (fields: Array<string>) => Promise<Object>;
  instance: (s: string) => ZendeskClientInstance;
  on: (s: string, callback: Function) => void;
}

type ZendeskClientContext = {
  host: string;
  instanceGuid: string;
  location: string;
  product: string;
}