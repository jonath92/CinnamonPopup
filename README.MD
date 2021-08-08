An alternative way to create PopupMenus for Cinnamon Applets

# Why needed?

The default Popup-Menu Implementation of Cinnamon has some disadvantages:

- It is confusing to instantiate. You need to create an instance of a `PopupMenuManager` and a `PopupMenu` and pass the `PopupMenu` to the `PopupMenuManager`. Why is a Manager necessary for only one PopupMenu?
- There is no prober version control and on the same time many applets depend on the implementation. Therefore it is almost impossible to make breaking changes in the implementation (breaking changes would basically mean that all applets using the class would need to be modified)
- It is not possible to copy the code and customize the code as the `emit` function wouldn't work.
- It is not well documented

# Usage

> :exclamation: In order to use it, the applet must be written in typescript and be configured with webpack. See the weather or radioApplet for examples.

This library currently only contains one function `createPopupMenu` (there should be added more later) which needs the launcher (i.e. applet actor) as launcher:

```ts
const myApplet = new IconApplet(...)

const popupMenu = createPopupMenu({laucher: myApplet.actor})
```

The so created popupMenu is just a `imports.gi.St.BoxLayout` with a css class which ensure the style. By executing the `createPopupMenu` function, the popupMenu is furthermore connected to the passed Applet Actor, which for example ensures that the popup Menu is always shown next to the applet.

As the popupMenu is just a `imports.gi.St.BoxLayout` all methods and properties are very well documented: https://gjs-docs.gnome.org/st10~1.0_api/st.boxlayout. The only additional method added to the popupMenu is function `toggle` which should be used to open/close the popupMenu:

```
myApplet.on_applet_clicked = () => popupMenu.toggle()
```

Widgets can be added to the popupMenu by `add_child` however it will most likely look pretty ugly (or is even not visible) as no style is provided. Therefore it is recommended to create another `BoxLayout` for each Widget give it the style_class 'popup-menu-item`

```ts
const popupMenuItem = new BoxLayout({
  style_class: 'popup-menu-item',
})

const label = new Label({
  text: 'my Item',
})

popupMenuItem.add_child(label)
```

# TODO

- There are no unit tests included
- Include more functions to make the creation of popupMenuItems (such as Seperator Item) more easily (see the radioApplet for an example). Therefore the bundling of this library needs to be improved.
- Allow usage of JavaScript?

```

```
