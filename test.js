webix.protoUI({
    name: "search2",
    $cssName: "search custom",
    $renderIcon: function () {
        var config = this.config;
        if (config.icons.length) {
            var height = config.aheight - 2 * config.inputPadding,
                padding = (height - 18) / 2 - 1,
                html = "", pos = 2;

            for (var i = 0; i < config.icons.length; i++) {
                html += "<span style='right:" + pos + "px;height:"
                    + (height - padding) + "px;padding-top:" + padding
                    + "px;' class='webix_input_icon " + config.icons[i] + "'></span>";

                pos += 24;
            }
            return html;
        }
        return "";
    },
    on_click: {
        "webix_input_icon": function (e, id, node) {
            var name = node.className.substr(node.className.indexOf("wxi-") + 4);
            return this.callEvent("on" + name + "IconClick", [e]);
        }
    },
}, webix.ui.search);

webix.ui({
    width: 400,
    rows: [
        {
            view: "search2", label: "Custom", icons: ["wxi-search", "wxi-close"], on: {
                onSearchIconClick: function () { webix.message("search") },
                onCloseIconClick: function () { webix.message("close") },
            }
        },
        {
            view: "search", label: "Standard"
        }
    ]
});