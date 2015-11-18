Branchee is a lightweight mobile navigation plugin with built in transitions.  The menu is generated from a basic unordered list.

## Menu

For the menu, wrap an unordered list with `.branchee-menu` and that with `branchee-theme-XXX`.

```html
<div id="menu-1" class="branchee-theme-base">
  <div class="branchee-menu">
    <ul>
      <li><a class="branchee-menu-item-active" href="#">Item 1</a>
        <ul>
          <li><a href="#">Item 1.1</a>
            <ul>
              <li><a href="#">Item 1.1.1</a></li>
              <li><a href="#">Item 1.1.2</a></li>
              <li><a href="#">Item 1.1.3</a></li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</div>
```

## Toggle

For the toggle, add a link to the page with `.branchee-toggle-menu` and whatever theme you are using.

```html
<a class="branchee-toggle-menu branchee-theme-base" href="#menu-1">Toggle</a>
```

## Plugin

Initialize the plugin by referencing the menu you created above

```js
$('#menu-1').branchee({
  onAfterInit: function () {
    this.toggleOpen();
  }
});
```

## Development

```bash
npm install
npm run watch-scss
```
