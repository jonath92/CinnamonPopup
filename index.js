"use strict";
exports.__esModule = true;
var _a = imports.gi.St, BoxLayout = _a.BoxLayout, Bin = _a.Bin, Side = _a.Side;
var _b = imports.ui.main, uiGroup = _b.uiGroup, layoutManager = _b.layoutManager, panelManager = _b.panelManager, pushModal = _b.pushModal, popModal = _b.popModal;
var KEY_Escape = imports.gi.Clutter.KEY_Escape;
var util_get_transformed_allocation = imports.gi.Cinnamon.util_get_transformed_allocation;
var PanelLoc = imports.ui.popupMenu.PanelLoc;
function createPopupMenu(args) {
    var launcher = args.launcher;
    var box = new BoxLayout({
        style_class: 'popup-menu-content',
        vertical: true,
        visible: false
    });
    // only for styling purposes
    var bin = new Bin({
        style_class: 'menu',
        child: box,
        visible: false
    });
    uiGroup.add_child(bin);
    box.connect('key-press-event', function (actor, event) {
        event.get_key_symbol() === KEY_Escape && close();
    });
    launcher.connect('queue-relayout', function () {
        if (!box.visible)
            return;
        setTimeout(function () {
            setLayout();
        }, 0);
    });
    bin.connect('queue-relayout', function () {
        if (!box.visible)
            return;
        setTimeout(function () {
            setLayout();
        }, 0);
    });
    function setLayout() {
        var freeSpace = calculateFreeSpace();
        var maxHeight = calculateMaxHeight(freeSpace);
        box.style = "max-height: " + maxHeight + "px;";
        var _a = calculatePosition(maxHeight, freeSpace), xPos = _a[0], yPos = _a[1];
        // Without Math.floor, the popup menu gets for some reason blurred on some themes (e.g. Adapta Nokto)!
        bin.set_position(Math.floor(xPos), Math.floor(yPos));
    }
    function calculateFreeSpace() {
        var _a, _b, _c, _d;
        var monitor = layoutManager.findMonitorForActor(launcher);
        var visiblePanels = panelManager.getPanelsInMonitor(monitor.index);
        var panelSizes = new Map(visiblePanels.map(function (panel) {
            var width = 0, height = 0;
            if (panel.getIsVisible()) {
                width = panel.actor.width;
                height = panel.actor.height;
            }
            return [panel.panelPosition, { width: width, height: height }];
        }));
        return {
            left: monitor.x + (((_a = panelSizes.get(PanelLoc.left)) === null || _a === void 0 ? void 0 : _a.width) || 0),
            bottom: monitor.y + monitor.height - (((_b = panelSizes.get(PanelLoc.bottom)) === null || _b === void 0 ? void 0 : _b.height) || 0),
            top: monitor.y + (((_c = panelSizes.get(PanelLoc.top)) === null || _c === void 0 ? void 0 : _c.height) || 0),
            right: monitor.x + monitor.width - (((_d = panelSizes.get(PanelLoc.right)) === null || _d === void 0 ? void 0 : _d.width) || 0)
        };
    }
    function calculateMaxHeight(freeSpace) {
        var freeSpaceHeight = (freeSpace.bottom - freeSpace.top) / global.ui_scale;
        var boxThemeNode = box.get_theme_node();
        var binThemeNode = bin.get_theme_node();
        var paddingTop = boxThemeNode.get_padding(Side.TOP);
        var paddingBottom = boxThemeNode.get_padding(Side.BOTTOM);
        var borderWidthTop = binThemeNode.get_border_width(Side.TOP);
        var borderWidthBottom = binThemeNode.get_border_width(Side.BOTTOM);
        var maxHeight = freeSpaceHeight - paddingBottom - paddingTop - borderWidthTop - borderWidthBottom;
        return maxHeight;
    }
    function calculatePosition(maxHeight, freeSpace) {
        var appletBox = util_get_transformed_allocation(launcher);
        var _a = box.get_preferred_size(), minWidth = _a[0], minHeight = _a[1], natWidth = _a[2], natHeight = _a[3];
        var margin = (natWidth - appletBox.get_width()) / 2;
        var xLeftNormal = Math.max(freeSpace.left, appletBox.x1 - margin);
        var xRightNormal = appletBox.x2 + margin;
        var xLeftMax = freeSpace.right - appletBox.get_width() - margin * 2;
        var xLeft = (xRightNormal < freeSpace.right) ? xLeftNormal : xLeftMax;
        var yTopNormal = Math.max(appletBox.y1, freeSpace.top);
        var yBottomNormal = yTopNormal + natHeight;
        var yTopMax = freeSpace.bottom - box.height;
        var yTop = (yBottomNormal < freeSpace.bottom) ? yTopNormal : yTopMax;
        return [xLeft, yTop];
    }
    function toggle() {
        box.visible ? close() : open();
    }
    // no idea why it sometimes needs to be bin and sometimes box ...
    function open() {
        setLayout();
        bin.show();
        box.show();
        launcher.add_style_pseudo_class('checked');
        pushModal(box);
        // For some reason, it is emmited the button-press event when clicking e.g on the desktop but the button-release-event when clicking on another applet
        global.stage.connect('button-press-event', handleClick);
        global.stage.connect('button-release-event', handleClick);
    }
    function close() {
        if (!box.visible)
            return;
        bin.hide();
        box.hide();
        launcher.remove_style_pseudo_class('checked');
        popModal(box);
    }
    function handleClick(actor, event) {
        if (!box.visible) {
            return;
        }
        var clickedActor = event.get_source();
        var binClicked = box.contains(clickedActor);
        var appletClicked = launcher.contains(clickedActor);
        (!binClicked && !appletClicked) && close();
    }
    box.toggle = toggle;
    // TODO: remove close
    box.close = close;
    return box;
}
exports.createPopupMenu = createPopupMenu;
