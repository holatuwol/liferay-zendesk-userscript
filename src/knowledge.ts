function addArticleFormattingButtons() : void {
  var toolbarContainers = <Array<HTMLDivElement>> Array.from(document.querySelectorAll('div[class*="ssc-container-85be2f31 src-components-EditorToolbar-index---bar---"]'));

  for (var i = 0; i < toolbarContainers.length; i++) {
    var toolbarContainer = toolbarContainers[i];

    if (toolbarContainer.classList.contains('lesa-ui-stackedit')) {
      continue;
    }

    toolbarContainer.classList.add('lesa-ui-stackedit');
  }
}