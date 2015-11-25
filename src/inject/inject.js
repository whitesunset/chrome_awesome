var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);

        function set_comment(textarea, content){
            setTimeout(function () {
                textarea.val(content);
                textarea.css('min-height', '200px');
                textarea.caretToStart();
            }, 1);
        }

        function reset_comment(textarea, templates, sign, values){
            var comment = textarea.val();
            templates.forEach(function (item, i, arr) {
                var template = replace_tags(item['code'], values);
                comment = comment.replace_all(template, '');
            });
            comment = comment.replace_all(sign, '');
            comment = comment.replace(/(\r\n|\n|\r)/gm,"");

            textarea.val(comment);
            textarea.css('height', '30px');
            textarea.css('min-height', 'auto');
            return comment;
        }

        function replace_tags(content, values){
            var result = content,
                tags = ['name', 'plugin_id', 'plugin_name', 'plugin_docs', 'plugin_demo', 'la', 'contact_form'];
            tags.forEach(function (item, i, arr) {
                result = result.replace_all('%' + item + '%', values[item]);
            });
            return result;
        }

        // smart replace for templates
        String.prototype.replace_all = function(find, replace){
            return this.split(find).join(replace);
            //return this.replace(new RegExp(find, 'g'), replace);
        };

        $.getJSON(chrome.extension.getURL('/cfg/default.json'), function (defaults) {
            chrome.runtime.sendMessage({method: "getData"}, function (response) {
                var la = 'Looks Awesome',
                    name = response.name || la,
                    plugin_id = parseInt(window.location.pathname.replace(/\D+/g, '')),
                    values = {
                        name: name,
                        plugin_id: plugin_id,
                        plugin_name: defaults[plugin_id]['name'],
                        plugin_docs: defaults[plugin_id]['docs'],
                        plugin_demo: defaults[plugin_id]['demo'],
                        la: la,
                        contact_form: defaults['contact_form'],
                    },

                    sign_enabled = parseInt(response.sign_enabled),
                    templates = response.templates,
                    sign = replace_tags(response.sign, values);

                if(sign_enabled == 1){
                    $('.f-textarea').on('focus', function () {
                        if ($(this).val() == '') {
                            set_comment($(this), '\n\n' + sign, 114);
                        }
                    });
                }

                $('.f-textarea').on('blur', function () {
                    if ($(this).val().trim() == sign) {
                        reset_comment($(this), templates, sign, values);
                    }
                });


                var toolbar = '<div class="la_chrome_toolbar">';
                toolbar += '<div class="la_chrome_templates">';
                templates.forEach(function (item, i, arr) {
                    toolbar += '<button class="la_chrome_template" data-la-template-id="' + i + '" id="la_chrome_template_' + i + '">' + item.name + '</button>'
                });
                toolbar += '</div>';
                toolbar += '</div>';

                $('.form.js-comment-reply-form').before(toolbar)
                
                $(document).on('click', '.la_chrome_template', function (e) {
                    var textarea = $(this).parents('.la_chrome_toolbar').siblings('form').find('textarea'),
                        template_id = parseInt($(e.target).attr('data-la-template-id')),
                        template_code = replace_tags(templates[template_id]['code'], values);

                    var comment = reset_comment(textarea, templates, sign, values);
                    if(sign_enabled == 1){
                        comment = comment + '\n\n' + sign;
                    }
                    set_comment(textarea, template_code + '\n' + comment);
                    textarea.off('onedit');
                    textarea.on('edit', function () {
                        var comment = reset_comment(textarea, templates, sign, values);
                        if(sign_enabled == 1){
                            comment = comment + '\n\n' + sign;
                        }
                        set_comment(textarea, template_code + '\n' + comment);
                    });
                });
            });
        });
    }
}, 10);

