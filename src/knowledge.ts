function addArticleCodeButton(
  toolbarContainer : HTMLDivElement,
  tinymce : TinyMCE
) : void {
  // Gets the buttons toolbar
  var toolbar = <HTMLDivElement> toolbarContainer.querySelector('.ssc-view-3df91d6a.ssc-group-f69f19c1');

  // Creates the code format container button
  var codeFormatButton = document.createElement('div');
  codeFormatButton.classList.add('ssc-view-3df91d6a', 'src-components-EditorToolbar-ToolbarButton---button---2IfvR');
  codeFormatButton.setAttribute('tabindex', '0');
  codeFormatButton.setAttribute('role', 'button');
  codeFormatButton.setAttribute('id', 'custom-code-format-button');
  codeFormatButton.setAttribute('data-test-id', 'toolbarCodeFormatButton');

  // Creates the code format label
  var codeFormatLabel = document.createElement('div');
  codeFormatLabel.classList.add('src-components-EditorToolbar-ToolbarButton---label---PACxZ');
  codeFormatLabel.setAttribute('title', 'Code Format');

  // Creates the code format icon
  var codeFormatIcon = document.createElement('img');
  codeFormatIcon.setAttribute('src', 'https://www.tiny.cloud/docs/images/icons/code-sample.svg'); // Icon taken from https://www.tiny.cloud/docs/advanced/editor-icon-identifiers/
  codeFormatIcon.setAttribute('alt', "code format")

  // Adds icon to the label
  codeFormatLabel.appendChild(codeFormatIcon);

  // Adds the label to the button
  codeFormatButton.appendChild(codeFormatLabel);

  // Adds the button to the toolbar
  var toolbarPreButton = <HTMLDivElement> toolbar.querySelector('div[data-test-id="toolbarPreButton"]');
  toolbar.insertBefore(codeFormatButton, toolbarPreButton);

  // Registers the button functionality
  // API: https://www.tiny.cloud/docs/api/tinymce/tinymce.formatter/
  var registerArguments = {
    inline: 'code'
  };

  if (cloneInto) {
    registerArguments = cloneInto(registerArguments, unsafeWindow);
  }

  tinymce.activeEditor.formatter.register('codeformat', registerArguments);

  // Adds function to the button
  codeFormatButton.addEventListener('click', function(e: Event) {
    var target = <HTMLElement> e.currentTarget;
    tinymce.activeEditor.focus();
    tinymce.activeEditor.formatter.toggle('codeformat');
    tinymce.DOM.toggleClass(target, 'src-components-EditorToolbar-ToolbarButton---active---3qTSV');
  })

  // Adds event listener to check <code> markup everywhere on the active editor
  var checkIfInCodeTag = function(e: TinyMCENodeChangeEvent) {
    if (e.element.nodeName == 'CODE') {
      codeFormatButton.classList.add('src-components-EditorToolbar-ToolbarButton---active---3qTSV');
    } else {
      codeFormatButton.classList.remove('src-components-EditorToolbar-ToolbarButton---active---3qTSV');
    }
  };

  if (exportFunction) {
    checkIfInCodeTag = exportFunction(checkIfInCodeTag, unsafeWindow);
  }

  tinymce.activeEditor.on('NodeChange', checkIfInCodeTag);
}

function addArticleFormattingButtons() : void {
  var tinymce = unsafeWindow.tinymce;

  if (!tinymce) {
    return;
  }

  var toolbarContainers = <Array<HTMLDivElement>> Array.from(document.querySelectorAll('div[class*="ssc-container-85be2f31 src-components-EditorToolbar-index---bar---"]'));

  for (var i = 0; i < toolbarContainers.length; i++) {
    var toolbarContainer = toolbarContainers[i];

    if (toolbarContainer.classList.contains('lesa-ui-stackedit')) {
      continue;
    }

    toolbarContainer.classList.add('lesa-ui-stackedit');

    addArticleCodeButton(toolbarContainer, tinymce);
  }
}