var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);

        function fix_scroll() {
            var location = window.location.href,
                comment_id = location.substr(location.lastIndexOf("comment_") + 8);
            setTimeout(function () {


                if (location.lastIndexOf("comment_") > -1) {
                    comment_id = comment_id.replace(/\D+/g, '');
                    var scroll = $("#comment_" + comment_id).offset().top;
                    console.log(scroll)
                    $('html, body').animate({
                        scrollTop: scroll
                    }, 800);
                }
            }, 10);
        }

        function draw_toolbars($textarea, templates) {
            var toolbar = '<div class="la_chrome_toolbar">';
            toolbar += '<div class="la_chrome_templates">';
            templates.forEach(function (item, i, arr) {
                toolbar += '<button class="la_chrome_template" data-la-template-id="' + i + '" id="la_chrome_template_' + i + '">' + item.name + '</button>'
            });
            toolbar += '</div>';
            toolbar += '</div>';

            $($textarea).parents('form').eq(0).before(toolbar);
        }

        function set_comment(textarea, content) {
            setTimeout(function () {
                textarea.val(content);
                textarea.css('min-height', '200px');
            }, 1);
        }

        function reset_comment(textarea, templates, sign, values) {
            var comment = textarea.val();
            templates.forEach(function (item, i, arr) {
                var template = replace_tags(item['code'], values);
                comment = comment.replace_all(template, '');
            });
            comment = comment.replace_all(sign, '');
            comment = comment.replace(/(\r\n|\n|\r)/gm, "");

            textarea.val(comment);
            textarea.css('height', '30px');
            textarea.css('min-height', 'auto');
            return comment;
        }

        function replace_tags(content, values) {
            var tags = [
                'name',
                'client_name',
                'plugin_id',
                'plugin_name',
                'plugin_docs',
                'plugin_demo',
                'plugin_quiz',
                'la',
                'site',
                'twitter',
                'facebook',
                'contact_form'
            ];

            tags.forEach(function (item, i, arr) {
                content = content.replace_all('%' + item + '%', '<%= ' + item + ' %>');
            });
            var template = _.template(content);
            return template(values);
        }

        function get_client(item) {
            var thread = $(item).parents('.js-discussion'),
                client = $('.js-comment', thread).eq(0).find('.comment__info .media .media__body a').html();
            return client;
        }

        function init($textarea, plugin_id, defaults, response) {
            var la = 'Looks Awesome',
                name = response.name || la,

                values = {
                    name: name,
                    client_name: '',
                    plugin_id: plugin_id,
                    plugin_name: defaults[plugin_id]['name'],
                    plugin_docs: defaults[plugin_id]['docs'][0],
                    plugin_demo: defaults[plugin_id]['demo'][0],
                    plugin_quiz: defaults[plugin_id]['quiz'][0] || '',
                    la: la,
                    site: defaults['site'][0],
                    twitter: defaults['twitter'][0],
                    facebook: defaults['facebook'][0],
                    contact_form: defaults['contact_form'][0],
                },

                sign_enabled = parseInt(response.sign_enabled),
                templates = response.templates,
                sign = replace_tags(response.sign, values);

            if (sign_enabled == 1) {
                $($textarea).on('focus', function (e) {
                    if ($(this).val() == '') {
                        set_comment($(this), '\n\n' + sign);
                        setTimeout(function () {
                            $(e.target).caretToStart();
                        }, 10);
                    }
                });
            }

            $($textarea).on('blur', function () {
                if ($(this).val().trim() == sign) {
                    reset_comment($(this), templates, sign, values);
                }
            });

            draw_toolbars($textarea, templates);

            $(document).on('click', '.la_chrome_template', function (e) {
                var textarea = $(this).parents('.la_chrome_toolbar').siblings('form').find('textarea'),
                    template_id = parseInt($(e.target).attr('data-la-template-id')),
                    client_name = get_client($(this));
                values.client_name = client_name;
                var template_code = replace_tags(templates[template_id]['code'], values);

                var comment = reset_comment(textarea, templates, sign, values);
                if (sign_enabled == 1) {
                    comment = comment + '\n\n' + sign;
                }
                set_comment(textarea, template_code + '\n\n' + comment);
                textarea.off('onedit');
                textarea.on('edit', function () {
                    var comment = reset_comment(textarea, templates, sign, values);
                    if (sign_enabled == 1) {
                        comment = comment + '\n\n' + sign;
                    }
                    set_comment(textarea, template_code + '\n\n' + comment);
                });
            });
        }

        // smart replace for templates
        String.prototype.replace_all = function (find, replace) {
            return this.split(find).join(replace);
            //return this.replace(new RegExp(find, 'g'), replace);
        };

        function isNumeric(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        $.getJSON(chrome.extension.getURL('/cfg/default.json'), function (defaults) {
            chrome.runtime.sendMessage({method: "getData"}, function (response) {
                var textareas = $('textarea.js-comment-new-reply-field').toArray();

                fix_scroll();
                textareas.forEach(function (item, i, arr) {
                    var parent = $(item).parents('.js-discussion').eq(0),
                        plugin_id_from_page = $('.comment__container > .js-comment > .comment__header > small > a', parent).eq(0).attr('href'),
                        plugin_id_from_url = window.location.pathname,
                        plugin_id = plugin_id_from_page || plugin_id_from_url;
                    plugin_id = +plugin_id.replace(/\D+/g, '');
                    if (isNumeric(plugin_id)) {
                        init(item, plugin_id, defaults, response);
                    }
                });
            });
        });
    }
}, 10);

