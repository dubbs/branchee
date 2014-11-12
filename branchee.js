/**
 * branchee.js
 * version: 1.0.0
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
    this.$el.on('click', '.'+this.options.classToggle, $.proxy(this._handleToggle, this));
  }

  /********
    PUBLIC
   *********/
  Branchee.prototype.init = function() {
  	
  	this.options.onBeforeInit.call(this);
  	
    this._setOriginalMenu();
    this._createPanes();
    this._setActivePane(this.$panes.last());

    this.options.onLoad.call(this);
  };

  Branchee.prototype.toggleOpen = function() {
    this.$el.toggleClass(this.options.classOpen);
    this._clearTransitions();
  };

  Branchee.prototype.getBackLink = function($pane) {
    return $pane.find('.'+this.options.classBackLink+' a');
  };

  Branchee.prototype.getActivePane = function() {
    return this.$panes.filter('.'+this.options.classMenuPaneActive);
  };


  /********
    PRIVATE
   *********/
  Branchee.prototype._setOriginalMenu = function () {
    this.$originalMenu = this.$menu.find('> ul').remove();
  };

  Branchee.prototype._createPanes = function() {
    this._processOriginalMenu(this.$originalMenu);
    this._setBackLinkPaneIds();
    this.$panes = this.$el.find('.' + this.options.classMenuPane);
  };


  Branchee.prototype._processOriginalMenu = function($ul) {

    var _this = this;

    // walk children
    $ul.find('> li').each(function () {
      var $childUl = $(this).children('ul');
      if ($childUl.length) {
        _this._processOriginalMenu($childUl);
      }
    });

    // do ul after, so it has an id generated
    this._processUL($ul);

  };

  Branchee.prototype._processUL = function($ul) {

    var menuPaneId = this._generateId();
    $ul.data('id', menuPaneId);

    var $pane = this._createMenuPaneWrapper(menuPaneId);
    var $paneUL = $pane.find('> ul');

    var $backLink = this._createBackLink($ul);
    if ($backLink.length) {
      $backLink.appendTo($paneUL);
    }

    this._addMenuPaneItems($paneUL, $ul.children('li'));

    this.options.onCreatePane.call(this, $pane, this._getPosition($ul));

    $pane.appendTo(this.$menu);
  };

  Branchee.prototype._generateId = function() {
    return Math.random().toString(36).slice(2);
  };

  Branchee.prototype._createMenuPaneWrapper = function(id) {
    return $('<div class="'+this.options.classMenuPane+'" id="branchee-pane-'+id+'"><ul></ul></div>');
  };

  Branchee.prototype._createBackLink = function($ul) {

    var $backLink = $([]);
    var $parentUL = $ul.parents('ul').first();

    if ($parentUL.length) {
      // get parent A
      var $parentA = $ul.siblings('a').clone();
      // create menu target
      var $span = $('<span class="'+this.options.classMenuPaneTarget+'" data-target="branchee-pane-xxx"></span>');
      // store UL until after it has an id
      $span.data('$ul', $parentUL);

      $parentA.append($span);
      $backLink = $parentA.wrap('<li class="'+this.options.classBackLink+'"></li>').parent(); 
    }

    return $backLink;
  };

  Branchee.prototype._addMenuPaneItems = function($ul, $lis) {
    var _this = this;
    $lis.each(function () {

      var $li = $(this);

      // get link
      var $a = $li.find('> a').clone();

      // add child target
      var $childUL = $li.children('ul');
      if ($childUL.length) {
        $a.append('<span class="'+_this.options.classMenuPaneTarget+'" data-target="branchee-pane-'+$childUL.data('id')+'"></span>');
      }

      // add link to pane
      $('<li>')
      .append($a)
      .appendTo($ul);

    });
  };

  Branchee.prototype._getPosition = function($ul) {
    var arr = [];
    $ul.parents('li').each(function () {
      arr.unshift($(this).index()+1);
    });
    return arr;
  };


  Branchee.prototype._setBackLinkPaneIds = function () {
    this.$el.find('[data-target="branchee-pane-xxx"]').each(function () {
      var id = $(this).data('$ul').data('id');
      $(this).attr('data-target', 'branchee-pane-' + id);
    });
  };

  Branchee.prototype._handleClick = function(e) {
    e.preventDefault();
    var $target = $(e.target);
    var $paneCurrent = $target.closest('.'+this.options.classMenuPane);
    var $paneTarget = this.$el.find('#' + $target.data('target'));

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
    this.toggleOpen();
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

      var config = $.extend(true, $.fn.branchee.defaults, options);

      var branchee = new Branchee(this, config);
      branchee.init();

    });

  };

  $.fn.branchee.defaults = {
    classMenuPaneActive:       'branchee-menu-pane-active',
    classMenuPane:             'branchee-menu-pane',
    classMenu:                 'branchee-menu',
    classBackLink:             'branchee-back',
    classMenuPaneTarget:       'branchee-pane-target',
    classTransitionExitRight:  'branchee-transition-exitright',
    classTransitionExitLeft:   'branchee-transition-exitleft',
    classTransitionEnterRight: 'branchee-transition-enterright',
    classTransitionEnterLeft:  'branchee-transition-enterleft',
    classOpen:                 'branchee-open',
    classToggle:               'branchee-toggle',
    onLoad: function () {},
    onCreatePane: function () {},
    onBeforeInit: function () {}
  };

})(this, this.document, this.jQuery);
