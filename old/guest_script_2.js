
// Sync language selector to stored preference
(function(){
    var sel = document.getElementById('langSelect');
    if(sel) sel.value = localStorage.getItem('pms_lang') || 'ko';
})();
