define(function(require, exports, module) {

    var CommandManager = brackets.getModule("command/CommandManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Menus = brackets.getModule("command/Menus"),
        KeyEvent = brackets.getModule("utils/KeyEvent"),

        AUTOMATCH = 'bracket.helper.toggle',
        _enabled = true,
        tabWidth = 4,
        lastWasBrace = false,
        insertNew = false;

    function _cursorHandler(event, editor, keyEvent) {
        if (keyEvent.type === "keydown") {
            var which = keyEvent.which
            if (which == 123) { //F12
                brackets.app.showDeveloperTools();
            }
            if (which == 13) { //Enter
                if (lastWasBrace) {
                    insertNew = true
                }
                lastWasBrace = false
            } else if (which != 16) { //shift
                lastWasBrace = false
            }
            if (which == 219 && keyEvent.shiftKey) { //{
                lastWasBrace = true
            }
            else{
                lastWasBrace = false
            }
        }
    }
    function _handler(event, document, change) {
        if (insertNew) {
            lastWasBrace = false
            insertNew = false
            var token = change.text[0],
                to = {
                    ch: change.from.ch + tabWidth,
                    line: change.from.line
                };
            from = {
                ch: change.from.ch + tabWidth,
                line: change.from.line + 1
            }
            $(document).off("change", _handler);

            function cc(lett, cnt) {
                out = ""
                for (var i = 0; i < cnt; i++) {
                    out += lett
                }
                return out
            }
            var to2 = {
                ch: 0,
                line:change.from.line+1
            }
            var from2 = {
                ch:0,
                line:change.from.line+2
            }
            var cnt = document.getRange(to, from).length - 5 + tabWidth
            document.replaceRange('',to2, from2);
            document.replaceRange('\n' + cc(' ', cnt) + '\n' + cc(' ', cnt - tabWidth) + '}', to);
            to.line += 1
            document._masterEditor.setCursorPos(to);
            $(document).on("change", _handler);
        }
    }

    function _registerHandlers(editor) {
        $(editor).on("keyEvent", _cursorHandler);
        $(editor.document).on("change", _handler);
        editor.document.addRef();
    }

    function _deregisterHandlers(editor) {
        $(editor).off("keyEvent", _cursorHandler);
        $(editor.document).off("change", _handler);
        editor.document.releaseRef();
    }

    function _toggle() {
        var _editor = EditorManager.getCurrentFullEditor();
        _enabled = !_enabled;
        CommandManager.get(AUTOMATCH).setChecked(_enabled);
        if (_enabled) {
            _registerHandlers(_editor);
        } else {
            _deregisterHandlers(_editor);
        }
    }
    $(EditorManager).on("activeEditorChange",

    function(event, current, previous) {
        if (_enabled) {
            if (previous) {
                _deregisterHandlers(previous);
            }
            if (current) {
                _registerHandlers(current);
            }
        }
    });

    CommandManager.register("Auto Braces Helper", AUTOMATCH, _toggle);
    Menus.getMenu(Menus.AppMenuBar.VIEW_MENU).addMenuItem(AUTOMATCH);
    CommandManager.get(AUTOMATCH).setChecked(_enabled);
});