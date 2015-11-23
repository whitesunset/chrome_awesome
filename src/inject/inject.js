var readyStateCheckInterval = setInterval(function () {
    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }
    // Behind the scenes method deals with browser
    // idiosyncrasies and such
    $.caretTo = function (el, index) {
        if (el.createTextRange) {
            var range = el.createTextRange();
            range.move("character", index);
            range.select();
        } else if (el.selectionStart != null) {
            el.focus();
            el.setSelectionRange(index, index);
        }
    };

    // The following methods are queued under fx for more
    // flexibility when combining with $.fn.delay() and
    // jQuery effects.

    // Set caret to a particular index
    $.fn.caretTo = function (index, offset) {
        return this.queue(function (next) {
            if (isNaN(index)) {
                var i = $(this).val().indexOf(index);

                if (offset === true) {
                    i += index.length;
                } else if (offset) {
                    i += offset;
                }

                $.caretTo(this, i);
            } else {
                $.caretTo(this, index);
            }

            next();
        });
    };

    // Set caret to beginning of an element
    $.fn.caretToStart = function () {
        return this.caretTo(0);
    };

    // Set caret to the end of an element
    $.fn.caretToEnd = function () {
        return this.queue(function (next) {
            $.caretTo(this, $(this).val().length);
            next();
        });
    };


    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://team.looks-awesome.com/envato_plugins.json", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                window['la_envato_plugins'] = JSON.parse(xhr.responseText);

                chrome.runtime.sendMessage({method: "getName"}, function(response) {
                    var name = response.name || 'Looks Awesome',
                        plugin_id = parseInt(window.location.href.replace(/\D+/g, '')),
                        docs_url = window['la_envato_plugins'][plugin_id]['docs'],
                        contact_form = window['la_envato_plugins']['contact_form'];
                        sign = '\n\n<p>Best Regards, <br />' + name + '</p>__________________<p><a href="' + docs_url + '">Docs & FAQ</a> | <a href="' + contact_form + '">Send us a private message</a></p>';

                    $('.f-textarea').on('focus', function () {
                        if ($(this).val() == '') {
                            var self = $(this);
                            setTimeout(function () {
                                self.val(sign);
                                self.css('height', '114px');
                                self.caretToStart()
                            }, 1);
                        }
                    });
                    $('.f-textarea').on('blur', function () {
                        if ($(this).val() == sign) {
                            $(this).val('');
                            $(this).css('height', '30px');
                        }
                    });
                });
            }
        }
        xhr.send();
    }
}, 10);

