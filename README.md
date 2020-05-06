# ZenDesk for TSEs (Attachments List, Comment Permalinks, Sidebar Quick Links, Compose with Stackedit)

* **Loop**: https://loop.liferay.com/home/-/loop/feed/15379250
* **Source**: https://github.com/holatuwol/liferay-zendesk-userscript

**Note**: Only tested in Opera (Violentmonkey), but it should work in other browsers since it doesn't use any special features. Any features that interact with ZenDesk apps (for example, there is a feature that auto-populates a few fields when you use the "Create Issue" link in the JIRA integration app) require using Tampermonkey or Violentmonkey, due to a known limitation with iframes in Greasemonkey 4 ([reference](https://github.com/greasemonkey/greasemonkey/issues/2574)).

---

[Eric Yan](https://loop.liferay.com/web/guest/home/-/loop/people/_eric.yan) highlighted a problem where finding attachments was difficult with Help Center (though this might be a training problem; we have no idea where to look for it), so I've created a user script to fix a few of the problems I've experienced with the ZenDesk UI.

**As of May 5, 2020 - 20:15 Pacific (version 10.2)**

The script adds the following functionality to the top of the ticket:

- A description (1st public comment)
- A list of any knowledge capture articles for the ticket
- A list of attachments with who attached it and when
- A workaround for [360001126648](https://grow.liferay.com/share/issues/360001126648), which downloads image attachments instead of opening them in a pop-up (only in the list of attachments)
- A "Download All" link which generates a zip file of all attachments for the ticket
- `CRITICAL` label, based on the rules in [Help Center Statuses and Priority](https://grow.liferay.com/share/Help+Center+Statuses+and+Priorities)
- `CUSTOMER REGION` label if the assignee region is different from the customer region
- Emoji markers for tags, which currently only includes `⚠️` for `cas_fire`, `cas_hot`, `cas_priority`

The script also adds the following functionality to the sidebar:

- A direct link to the Project Details of each client, based on [David Balatoni's bookmarklet](https://loop.liferay.com/home/-/loop/feed/15055909)
- A shareable public permalink for the ticket
- A direct link to the Patcher Portal for each client's builds
- A JIRA search query link to navigate back to LPPs from ZenDesk (in case the app is acting up)
- All tags are clickable, and open a window to search for tickets with the same tag

The script also adds the following functionality within the comments:

- In the "all" and "internal" conversations tab, agent view comment permalinks, which will no longer will be needed if ZenDesk implements [218754568](https://support.zendesk.com/hc/en-us/community/posts/218754568-Permalinks-to-ZenDesk-comments) or [220971087](https://support.zendesk.com/hc/en-us/community/posts/220971087-Provide-a-way-to-add-deep-or-permanent-links-to-specific-comments-in-a-Ticket)
- In the "public" conversations tab, help center comment permalinks
- When viewing existing comments, replace plain text JIRA ticket names (LPE-1 LPS-2 LPP-3) with ticket links
- When viewing existing comments, makes any Help Center comment permalinks behave as though they were agent view comment permalinks

It also provides the following functionality for authoring comments:

- Provide a button that allows you to underline text, in case your browser intercepts Ctrl+U
- Provide a button that opens up a Stackedit window so you can compose your comment with Markdown

For the pop-up modal window you use to create JIRA tickets:

- Makes all modal windows draggable (so you can move them around)
- Allows you to accidentaly click outside of a modal window without auto-closing it
- Auto-populates a few fields when clicking the "Create Issue" button in the JIRA app

It also updates the editor used for creating knowledge base articles:

- Adds a "Code Format" button so you can get inline code (rather than just code blocks)

Finally, in other areas of the UI, the script does the following:

- Adds the account code to all open tabs
- Updates the window title to make it easier to find tickets via browser history