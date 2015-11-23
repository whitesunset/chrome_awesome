// Saves options to chrome.storage
function save_options() {
    var name = document.getElementById('name').value;

    localStorage['la_envato_name'] = name;
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
        status.textContent = '\u00A0';
    }, 1500);

}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    var name =  localStorage['la_envato_name'] || 'Looks Awesome';
    document.getElementById('name').value = name;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);