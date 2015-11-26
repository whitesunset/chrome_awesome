function insert_template(item, i){
    i = i || $('#templates > div').length;
    var name = item ? item.name : '',
        code = item ? item.code : '',
        template = '<div class="field-block template" data-template-id="' + i + '">\
                            <label class="label" for="template_' + i + '">Template #' + i + '<br><button class="delete-template pure-button button-error">Delete</button></label>\
                            <input class="field" type="text" name="template_' + i + '_name" id="template_' + i + '_name" value="' + name + '"/>\
                            <textarea class="field" name="template_' + i + '_code" id="template_' + i + '_code">' + code + '</textarea>\
                        </div>';
    $('#templates').append(template);
}

// Saves options to chrome.storage
function save_options() {
    var name = $('#name').val(),
        sign = $('#sign').val(),
        sign_enabled = parseInt($('#sign_enabled').attr('data-checked')),
        templates = $('#templates .template').toArray();

    localStorage['la_name'] = name;
    localStorage['la_sign'] = sign;
    localStorage['la_sign_enabled'] = sign_enabled;
    var la_templates = new Array();
    templates.forEach(function (item, i, arr) {
        la_templates.push({
            name: $(item).find('input[type="text"]').val(),
            code: $(item).find('textarea').val()
        })
    });
    localStorage['la_templates'] = JSON.stringify(la_templates);

    // update status
    var status = document.getElementById('status');
    status.textContent = 'Options saved';
    setTimeout(function() {
        status.textContent = '\u00A0';
    }, 1500);

}

// Restores select box and checkbox state using the preferences
function restore_options() {
    var name,
        sign,
        sign_enabled,
        templates;
    if(localStorage['la_templates']){
        templates = JSON.parse(localStorage['la_templates']);
    }else{
        templates = [{
            name: 'Hello',
            code: 'Hello %client_name%,'
        },{
            name: 'Access',
            code: 'Hi, please <a href="%contact_form%">contact us</a> and send your URL and temporary admin access so we can inspect this and help.'
        },{
            name: 'Live URL',
            code: 'Hello, please share live URL.'
        },{
            name: 'Later',
            code: 'Hello. We plan to add this in future updates.\nThank you for feedback!'
        }];
        localStorage['la_templates'] = JSON.stringify(templates);
    }
    if(localStorage['la_name']){
        name =  localStorage['la_name']
    }else{
        name =  'Looks Awesome';
        localStorage['la_name'] = name;
    }
    if(localStorage['la_sign']){
        sign =  localStorage['la_sign'];
    }else{
        sign = '<p>Best Regards, <br />%name%</p>__________________<p><a href="%plugin_docs%">Docs & FAQ</a> | <a href="%contact_form%">Send us a private message</a></p>';
        localStorage['la_sign'] = sign;
    }
    if(localStorage['la_sign_enabled']){
        sign_enabled =  localStorage['la_sign_enabled']
    }else{
        sign_enabled = 1;
        localStorage['la_sign_enabled'] = sign_enabled;
    }



    $('#templates').html('');
    templates.forEach(function (item, i, arr) {
        insert_template(item, i);
    });

    $('#name').val(name);
    $('#sign').val(sign);
    $('#sign_enabled').attr('data-checked', sign_enabled);
}

(function ($) {
    $(function () {
        $('#add_template').on('click', function () {
            insert_template()
        });
        
        $(document).on('click', '.delete-template', function () {
            var template_id = parseInt($(this).parents('.template').attr('data-template-id'));
            var templates = JSON.parse(localStorage['la_templates']);
            console.log($(this).parents('template'))
            templates.splice(template_id, 1);
            localStorage['la_templates'] = JSON.stringify(templates);
            $('[data-template-id="' + template_id + '"]').remove();

        });

        // preview blocks visibility
        $('.toggle').on('click', function(e){
            e.preventDefault();
            var $el = $(this);
            var $input = $el.find('input');
            if($input.attr('data-checked') == 1){
                $input.val('0');
                $input.attr('data-checked', '0');
            }else{
                $input.val('1');
                $input.attr('data-checked', '1');
            }
        });
    });
})(jQuery);


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);