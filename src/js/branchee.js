
(function (window, document, $) {

  function Branchee($el, options) {

    var $menu = $el.find('.'+options.classMenu);
    var $menuPanes = null;

    /**
     * Clear CSS Transitions
     */
    var clearTransitions = function () {
      var classList = [
        options.classTransitionExitRight,
        options.classTransitionExitLeft,
        options.classTransitionEnterRight,
        options.classTransitionEnterLeft
      ].join(' ');
      $menuPanes.removeClass(classList);
    };

    /**
     *
     */
    var setActivePane = function ($paneTarget) {
      $menuPanes.removeClass(options.classMenuPaneActive);
      $paneTarget.addClass(options.classMenuPaneActive);
    };

    /**
     *
     */
    var toggleOpen = function () {
      var id = $el.attr('id');

      // toggle anchor
      var $toggle = $('.branchee-toggle-menu[href="#'+id+'"]');
      $toggle.toggleClass(options.classOpen);

      // toggle menu
      $el.toggleClass(options.classOpen);

      clearTransitions();

      options.onAfterToggle.call(this, $toggle);
    };

    /**
     * Handle menu toggle click
     */
    var handleToggle = function (e) {
      e.preventDefault();
      if ($el.attr('id') === $(e.currentTarget).attr('href').substring(1)) {
        toggleOpen();
      }
    };

    /**
     * Handle pane target click
     */
    var handleClick = function (e) {

      e.preventDefault();
      var $target = $(e.target);
      // go up to menu pane
      var $paneCurrent = $target.closest('.'+options.classMenuPane);

      var $paneTarget = $el.find('['+options.dataPaneId+'="' + $target.data(options.classMenuPaneTarget) + '"]');

      clearTransitions();

      if($target.closest('.'+options.classBackLink).length !== 0) {
        // back
        $paneCurrent.addClass(options.classTransitionExitRight);
        $paneTarget.addClass(options.classTransitionEnterLeft);
      } else {
        // forward
        $paneCurrent.addClass(options.classTransitionExitLeft);
        $paneTarget.addClass(options.classTransitionEnterRight);
      }

      setActivePane($paneTarget);

    };

    /**
     * Generate a unique pane id
     */
    var generateId = function () {
      return Math.random().toString(36).slice(2);
    };

    /**
     *
     */
    var addRootId = function () {
      $menu.find('> ul').attr(options.dataPaneId, generateId());
    };

    /**
     *
     */
    var addSectionLabel = function (index, element) {
      $(element).addClass(options.classSection + ' ' + options.classSectionPrefix+(index+1));
      $(element).find('ul').addClass(options.classSection + ' ' + options.classSectionPrefix+(index+1));
    };

    /**
     *
     */
    var addSectionLabels = function () {
      $menu.children('ul').children('li').each(addSectionLabel);
    };

    /**
     *
     */
    var appendPaneTargets = function (index, element) {
      var paneTargetId = generateId();
      $(element).siblings('ul').attr(options.dataPaneId, paneTargetId);
      $(element).append('<span class="'+options.classMenuPaneTarget+'" '+options.dataPaneTarget+'="'+paneTargetId+'"></span>');
    };

    /**
     *
     */
    var addPaneTargets = function () {
      // a + ul ?
      var $itemsWithPaneTarget = $menu.find('ul').parents('li').children('a');
      $itemsWithPaneTarget.each(appendPaneTargets);
    };

    /**
     *
     */
    var addMenuToggleTarget = function () {
      var id = $el.attr('id');
      var $toggle = $('.branchee-toggle-menu[href="#'+id+'"]');
      $toggle.prepend('<span class="branchee-toggle-menu-icon"></span>');
    };

    /**
     *
     */
    var addBackLink = function (index, element) {
      var $a = $(element).siblings('a').clone();
      // update pane target
      var paneId = $(element).parents('ul').attr(options.dataPaneId);
      $a.children('span').attr(options.dataPaneTarget, paneId);
      // add as first child to pane
      $a.prependTo($(element)).wrap("<li class='"+options.classBackLink+"'></li>");
    };

    /**
     *
     */
    var addBackLinks = function () {
      var $panes = $menu.find('['+options.dataPaneId+']');
      $panes.each(addBackLink);
    };

    /**
     *
     */
    var createPane = function (index, element) {

      // copy ul and remove children
      var $ul = $(element).clone();
      $ul.find('ul').remove();

      // create wrapper fragment and copy pane id
      var $wrapper = $('<div class="'+options.classMenuPane+'"></div>');
      $wrapper.attr(options.dataPaneId, $ul.attr(options.dataPaneId));

      // remove existing pane id on ul and wrap
      $ul.removeAttr(options.dataPaneId).appendTo($menu).wrap($wrapper);
    };

    /**
     *
     */
    var createPanes = function () {
      var $panes = $menu.find('['+options.dataPaneId+']');
      $panes.each(createPane);
      $menuPanes = $menu.find('.'+options.classMenuPane);
    };

    /**
     * Remove original menu from DOM
     */
    var removeOriginalMenu = function () {
      $menu.find('> ul').remove();
    };

    /**
     *
     */
    var init = function () {

      options.onBeforeInit.call(this);

      addRootId();
      addSectionLabels();
      addPaneTargets();
      addMenuToggleTarget();
      addBackLinks();
      createPanes();
      removeOriginalMenu();
      setActivePane($menuPanes.first());

      options.onAfterInit.call(this);

    };


    /**
     * Bind pane target click event
     */
    $el.on('click', '.'+options.classMenuPaneTarget, handleClick);

    /**
     * Bind menu toggle click event
     */
    if (options.handleToggle) {
      $(document).on('click', '.'+options.classToggleMenu, handleToggle);
    }

    /**
     * Public API
     */
    return {
      init: init,
      toggleOpen: toggleOpen,
      clearTransitions: clearTransitions
    };

  }

  /**
   * jQuery function
   */
  $.fn.branchee = function(options) {

    options = $.extend({}, $.fn.branchee.defaults, options);

    return this.each(function() {
      var $el = $(this);
      var branchee = Branchee($el, options).init();
      $el.data('branchee', branchee);
    });

  };

  /**
   * jQuery defauls
   */
  $.fn.branchee.defaults = {
    handleToggle:              true,
    classBackLink:             'branchee-back',
    classMenuItemActive:       'branchee-menu-item-active',
    classMenuPaneActive:       'branchee-menu-pane-active',
    classMenuPane:             'branchee-menu-pane',
    classMenu:                 'branchee-menu',
    classOpen:                 'branchee-open',
    classMenuPaneTarget:       'branchee-pane-target',
    classSection:              'branchee-section',
    classSectionPrefix:        'branchee-section--',
    classToggle:               'branchee-toggle', // deprecated in version 2.0
    classToggleExt:            'branchee-toggle-ext', // deprecated in version 2.0
    classToggleMenu:           'branchee-toggle-menu',
    classTransitionEnterLeft:  'branchee-transition-enterleft',
    classTransitionEnterRight: 'branchee-transition-enterright',
    classTransitionExitLeft:   'branchee-transition-exitleft',
    classTransitionExitRight:  'branchee-transition-exitright',
    dataPaneId:                'data-branchee-pane-id',
    dataPaneTarget:            'data-branchee-pane-target',
    onBeforeInit: function () {},
    onAfterInit: function () {},
    onAfterToggle: function () {}
  };

})(this, this.document, this.jQuery);
