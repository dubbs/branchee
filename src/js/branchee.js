/**
 * branchee.js
 * version: 1.1.4
 * author: dubbs
 * license: MIT
 */
(function (window, document, $) {

  function Branchee(el, options) {

    this.options = options;

    this.$el = $(el);
    this.$menu = this.$el.find('.'+this.options.classMenu);

    this.$panes = null;

    this.$el.on('click', '.'+this.options.classMenuPaneTarget, $.proxy(this._handleClick, this));
    $(document).on('click', '.'+this.options.classToggleMenu, $.proxy(this._handleToggle, this));
  }

  /********
    PUBLIC
   *********/
  Branchee.prototype.init = function() {

    this.options.onBeforeInit.call(this);

    this._addRootId();
    this._addSectionLabels();
    this._addPaneTargets();
    this._addMenuToggleTarget();
    this._addBackLinks();
    this._createPanes();
    this._removeOriginalMenu();
    this._setActivePane(this.$panes.first());

    this.options.onAfterInit.call(this);
  };

  Branchee.prototype.toggleOpen = function() {

    var id = this.$el.attr('id');

    // toggle anchor
    var $toggle = $('.branchee-toggle-menu[href="#'+id+'"]');
    $toggle.toggleClass(this.options.classOpen);

    // toggle menu
    this.$el.toggleClass(this.options.classOpen);

    this._clearTransitions();

    this.options.onAfterToggle.call(this);
  };

  Branchee.prototype.getActivePane = function() {
    return this.$panes.filter('.'+this.options.classMenuPaneActive);
  };

  Branchee.prototype.getActivePaneByPath = function(path) {
    var $activeLinks = this.$menu.find('a[href="'+path+'"]');
    $activeLinks.addClass(this.options.classMenuItemActive);

    var $activeLinksLI = $activeLinks.closest('li');

    var $activeLinksWithBack = $activeLinksLI.filter('.'+this.options.classBackLink);
    if ($activeLinksWithBack.length) {
      return $activeLinksWithBack.closest('.'+this.options.classMenuPane);
    }

    if ($activeLinksLI.first().length) {
      return $activeLinksLI.first().closest('.'+this.options.classMenuPane);
    }
  };

  Branchee.prototype.setActivePane = function($paneTarget) {
    this._setActivePane($paneTarget);
  };

  /********
    PRIVATE
   *********/
  Branchee.prototype._addRootId = function () {
    this.$menu.find('> ul').attr(this.options.dataPaneId, this._generateId());
  };

  Branchee.prototype._addSectionLabels = function () {
    this.$menu.children('ul').children('li').each($.proxy(this._addSectionLabel, this));
  };

  Branchee.prototype._addSectionLabel = function (index, element) {
    $(element).addClass(this.options.classSection + ' ' + this.options.classSectionPrefix+(index+1));
    $(element).find('ul').addClass(this.options.classSection + ' ' + this.options.classSectionPrefix+(index+1));
  };

  Branchee.prototype._addMenuToggleTarget = function () {
    var id = this.$el.attr('id');
    var $toggle = $('.branchee-toggle-menu[href="#'+id+'"]');
    $toggle.prepend('<span></span>');
  };

  Branchee.prototype._addPaneTargets = function () {
    // a + ul ?
    var $itemsWithPaneTarget = this.$menu.find('ul').parents('li').children('a');
    $itemsWithPaneTarget.each($.proxy(this._appendPaneTargets, this));
  };

  Branchee.prototype._appendPaneTargets = function (index, element) {
    var paneTargetId = this._generateId();
    $(element).siblings('ul').attr(this.options.dataPaneId, paneTargetId);
    $(element).append('<span class="'+this.options.classMenuPaneTarget+'" '+this.options.dataPaneTarget+'="'+paneTargetId+'"></span>');
  };

  Branchee.prototype._addBackLinks = function () {
    var $panes = this.$menu.find('['+this.options.dataPaneId+']');
    $panes.each($.proxy(this._addBackLink, this));
  };

  Branchee.prototype._addBackLink = function (index, element) {
    var $a = $(element).siblings('a').clone();
    // update pane target
    var paneId = $(element).parents('ul').attr(this.options.dataPaneId);
    $a.children('span').attr(this.options.dataPaneTarget, paneId);
    // add as first child to pane
    $a.prependTo($(element)).wrap("<li class='"+this.options.classBackLink+"'></li>");
  };

  Branchee.prototype._createPanes = function () {
    var $panes = this.$menu.find('['+this.options.dataPaneId+']');
    $panes.each($.proxy(this._createPane, this));
    this.$panes = this.$menu.find('.'+this.options.classMenuPane);
  };

  Branchee.prototype._createPane = function (index, element) {
    // copy ul and remove children
    var $ul = $(element).clone();
    $ul.find('ul').remove();

    // create wrapper fragment and copy pane id
    var $wrapper = $('<div class="'+this.options.classMenuPane+'"></div>');
    $wrapper.attr(this.options.dataPaneId, $ul.attr(this.options.dataPaneId));

    // remove existing pane id on ul and wrap
    $ul.removeAttr(this.options.dataPaneId).appendTo(this.$menu).wrap($wrapper);
  };

  Branchee.prototype._removeOriginalMenu = function () {
    this.$menu.find('> ul').remove();
  };

  Branchee.prototype._generateId = function() {
    return Math.random().toString(36).slice(2);
  };

  Branchee.prototype._handleClick = function(e) {
    e.preventDefault();
    var $target = $(e.target);
    // go up to menu pane
    var $paneCurrent = $target.closest('.'+this.options.classMenuPane);

    var $paneTarget = this.$el.find('['+this.options.dataPaneId+'="' + $target.data(this.options.classMenuPaneTarget) + '"]');

    this._clearTransitions();

    if($target.closest('.'+this.options.classBackLink).length !== 0) {
      // back
      $paneCurrent.addClass(this.options.classTransitionExitRight);
      $paneTarget.addClass(this.options.classTransitionEnterLeft);
    } else {
      // forward
      $paneCurrent.addClass(this.options.classTransitionExitLeft);
      $paneTarget.addClass(this.options.classTransitionEnterRight);
    }

    this._setActivePane($paneTarget);
  };

  Branchee.prototype._handleToggle = function(e) {
    e.preventDefault();

    if (this.$el.attr('id') === $(e.target).attr('href').substring(1)) {
      this.toggleOpen();
    }
  };

  Branchee.prototype._clearTransitions = function() {
    var classList = [
      this.options.classTransitionExitRight,
      this.options.classTransitionExitLeft,
      this.options.classTransitionEnterRight,
      this.options.classTransitionEnterLeft
    ].join(' ');
    this.$panes.removeClass(classList);
  };

  Branchee.prototype._setActivePane = function($paneTarget) {
    this.$panes.removeClass(this.options.classMenuPaneActive);
    $paneTarget.addClass(this.options.classMenuPaneActive);
  };


  this.Branchee = Branchee;

  // JQUERY
  $.fn.branchee = function(options) {

    return this.each(function() {

      var config = $.extend({}, $.fn.branchee.defaults, options);
      var branchee = new Branchee(this, config);
      branchee.init();

    });

  };

  $.fn.branchee.defaults = {
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
