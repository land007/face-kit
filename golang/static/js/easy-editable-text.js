var retext = function() {
    $('.edit').click(function() {
        $(this).hide();
        $(this).next().show();
        $(this).next().select();
    });
    $('input[type="text"]').blur(function() {
        if ($.trim(this.value) == '') {
            this.value = (this.defaultValue ? this.defaultValue : '');
        } else {
            $(this).prev().html(this.value);
        }
        $(this).hide();
        $(this).prev().show();
    });
    $('input[type="text"]').keypress(function(event) {
        if (event.keyCode == '13') {
            if ($.trim(this.value) == '') {
                this.value = (this.defaultValue ? this.defaultValue : '');
            } else {
                $(this).prev().html(this.value);
            }
            $(this).hide();
            $(this).prev().show();
        }
    });
}
$(document).ready(retext());
