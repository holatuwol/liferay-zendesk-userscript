## Build Instructions

You can install the script by visiting the pre-built version stored in the following raw GitHub content link:

- https://raw.githubusercontent.com/holatuwol/liferay-faster-deploy/master/userscripts/zendesk.user.js

If you would like to build this user script from source, the source code is found in the following repository:

- https://github.com/holatuwol/liferay-zendesk-userscript

You then use the following commands to convert the typescript into a user script:

```bash
npm install
node node_modules/typescript/bin/tsc
```

Once the build is complete, you will find the file in `build/zendesk.user.js`.

To install this built script, open up your user script manager for your browser, and either (a) save this as a new script if you've never installed the script before, or (b) edit the existing Zendesk for TSEs script if you've already installed it from the remote URL provided above.

**Note**: Only tested in Opera (Violentmonkey), but it should work in other browsers since it doesn't use any special features. Any features that interact with ZenDesk apps (for example, there is a feature that auto-populates a few fields when you use the "Create Issue" link in the JIRA integration app) require using Tampermonkey or Violentmonkey, due to a known limitation with iframes in Greasemonkey 4 ([reference](https://github.com/greasemonkey/greasemonkey/issues/2574)).

## Feature Documentation

Eric Yan highlighted a problem where finding attachments was difficult with Help Center (though this might be a training problem; we have no idea where to look for it), so I've created a user script to fix a few of the problems I've experienced with the ZenDesk UI.

**As of June 12, 2023 - 13:40 Pacific (version 17.3)**

The script adds the following to the ticket:

- A description (1st public comment)
- A list of Fast Track (knowledge capture) articles for the ticket
- A list of attachments with who attached it and when
- A "Generate Bulk Download" link which generates a zip file of all attachments for the ticket

The script adds the following markers to the top of the ticket:

- `CRITICAL` marker, `PREMIUM CRITICAL` marker, or `PLATINUM CRITICAL` marker, based on the rules in [Help Center Statuses and Priority](https://liferay.atlassian.net/wiki/spaces/SUPPORT/pages/1741783196/Help+Center+Statuses+and+Priorities)
- `CUSTOMER REGION` marker if the assignee region is different from the customer region
- `GS OPPORTUNITY`, `SERVICE PORTAL CUSTOMER`, `COMMERCE PORTAL CUSTOMER` when the ticket has the corresponding label
- `⚠️` emoji marker if the ticket has any of the following labels: `cas_fire`, `cas_hot`, `cas_priority`

The script also provides a marker related to whether the customer has accepted Extended Premium Support:

- `EXTENDED PREMIUM SUPPORT` marker if the customer accepted
- `DECLINED X.Y EPS` marker if the customer declined
- `END OF SOFTWARE LIFE` marker if the customer has neither accepted nor declined

The script also adds the following functionality to the sidebar:

- A direct link to the Koroneiki data for each client
- A shareable public permalink for the ticket
- A direct link to the Patcher Portal for each client's builds
- A JIRA search query link to navigate back to LPPs from ZenDesk (in case the app is acting up)
- All tags are clickable, and open a window to search for tickets with the same tag

The script also adds the following functionality within the comments:

- Agent view comment permalinks, which will no longer will be needed if ZenDesk implements [218754568](https://support.zendesk.com/hc/en-us/community/posts/218754568-Permalinks-to-ZenDesk-comments) or [220971087](https://support.zendesk.com/hc/en-us/community/posts/220971087-Provide-a-way-to-add-deep-or-permanent-links-to-specific-comments-in-a-Ticket)
- When viewing existing comments, replace plain text JIRA ticket names (LPE-1 LPS-2 LPP-3) with ticket links
- When viewing existing comments, makes any Help Center comment permalinks behave as though they were agent view comment permalinks

The script also provides the following functionality for authoring comments:

- Provide a button that allows you to underline text, in case your browser intercepts Ctrl+U
- Provide a link to playbooks for platinum critical and premium critical tickets

The script also updates the pop-up modal window you use to create JIRA tickets:

- Makes all modal windows draggable (so you can move them around)
- Allows you to click outside of a modal window without auto-closing it
- Auto-populates a few fields when clicking the "Create Issue" button in the JIRA app

The script also updates the editor used for creating knowledge base articles:

- Adds a "Code Format" button so you can get inline code (rather than just code blocks)

Finally, in other areas of the UI, the script does the following:

- Adds the account code to all open tabs
- Updates the window title to make it easier to find tickets via browser history
- Changes the color for the open-pending ticket label so that it’s different from open
- Shortens the text label describing ticket status to one letter (except open-pending, which is OP)