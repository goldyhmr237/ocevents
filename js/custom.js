$(function ()
{
	// Media element
	
	$('video:not(.noplayer),audio').mediaelementplayer(/* Options */);

	// Login
	
	$('#reset_button').click(function (e) 
    {
        e.preventDefault();
		$('#resetPasswordBox').slideToggle();
		$('#loginBox').slideUp();
	});

	$('#login_button').click(function (e) 
    {
        e.preventDefault();
		$('#loginFacebookBox').slideUp();
		$('#loginBox').slideToggle();
	});

	$('#back_button').click(function (e) 
    {
        e.preventDefault();
		$('#resetPasswordBox').slideUp();
		$('#loginFacebookBox').slideToggle();
	});

	$('div.errorMessage').click(function () {
		$(this).fadeTo('slow', 0);
		$(this).slideUp(300)
	});
    
    $('form.has-image-upload').on('submit', function () 
    {
        $(this).find('.loader-wrapper').removeClass('hide');
    });
    
    $('.file-upload input[type="file"]').on('change', function () 
    {
        var el = $(this);
        if (el.val()) {
            el.parents('i').addClass('active');
        } else {
            el.parents('i').removeClass('active');
        }
    });
    
    $('.reply-to-comment,.reply-cancel').on('click', function (e) 
    {
        e.preventDefault();
         alert('hi')
        var container = $(this).parents('.questions-item-container');
        container.find('.reply-form').toggleClass('hide');
    });
    
    $('.delete-comment').on('click', function (e) 
    {
        e.preventDefault();
        
        if (confirm(keywords.commentDeleteConfirmation)) {
            window.location = $(this).data('url');
        }
    });
    
    $('.images-container').each(function () 
    {
        $(this).magnificPopup({
            delegate: 'a',
            type: 'image',
            gallery: {
                enabled: true
            }
        });
    });
});
 $('#show-form-container').on('click', function ()
    {
        var container = $('.main-questions-form-container');
        // Hide all other forms besides this one.
        $('.questions-filter-items').not(container).slideUp();
        // Hide main form container.
        container.slideToggle();
    });

    /**
     * Accept cookies policy on click event.
     *
     * Add cookie to remember the accept answer and hide the popover.
     */
    $('.main-wrapper').on('click', '.accept-cookies-policy', function () {
        Cookies.set('accept_cookie_policy', 1, {expires: 365});
        $('header').popover('destroy')
    });

    $('.has-file-upload').each(function () {
        var form = $(this);
        var options = {
            singleFileUploads: false,
            url: localLink + 'modules/gamification/ajax/frontend_ws.php',
            previewCrop: true,
            // Enable image resizing, except for Android and Opera,
            // which actually support image resizing, but fail to
            // send Blob objects via XHR requests:
            disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
            downloadTemplateId: null,
            messages: {
                maxNumberOfFiles: keywords.maxNumberOfFiles
            },
            add: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }

                data.form.find('button[name="submit"]').off('click').on('click', function (event) {
                    event.preventDefault();
                    data.submit();
                });

                // Get the errors container.
                var errorStatus = data.form.find('.error-status');

                var $this = $(this),
                    that = $this.data('blueimp-fileupload') ||
                        $this.data('fileupload'),
                    options = that.options;
                data.context = that._renderUpload(data.files)
                    .data('data', data)
                    .addClass('processing');
                options.filesContainer[
                    options.prependFiles ? 'prepend' : 'append'
                    ](data.context);
                that._forceReflow(data.context);
                that._transition(data.context);
                data.process(function () {
                    return $this.fileupload('process', data);
                }).always(function () {
                    // Remove old errors.
                    errorStatus.empty();

                    data.context.each(function (index) {
                        $(this).find('.size').text(
                            that._formatFileSize(data.files[index].size)
                        );
                    }).removeClass('processing');
                    that._renderPreviews(data);
                }).done(function () {
                    errorStatus.addClass('hide');
                }).fail(function () {
                    if (!data.files.error) {
                        return;
                    }

                    errorStatus.removeClass('hide');

                    var errors = [];
                    data.context.each(function (index) {
                        var error = data.files[index].error;
                        if (error && $.inArray(error, errors) == -1) {
                            errors.push(error);
                            errorStatus.append(error);
                        }
                    });
                });
            },
            done: function (e, data) {
                if ('success' == data.result.status) {
                    window.location.reload();
                } else if ('error' == data.result.status) {
                    data.form.find('.error-status').empty().append(data.result.error_msg);
                }
            }
        };

        if (form.data('max-number-of-files') != undefined) {
            options.maxNumberOfFiles = parseInt(form.data('max-number-of-files'));
        }

        form.fileupload(options);
    });

    if (typeof Swiper !== 'undefined') {
        var swiper = new Swiper('.swiper-container', {
            slidesPerView: Math.floor(document.documentElement.clientWidth / 90),
            spaceBetween: 5,
            observer: true
        });

        $(window).resize(function () {
            swiper.params.slidesPerView = Math.floor(document.documentElement.clientWidth / 90);
        });
    }

    /**
     * Handle comments images delete.
     */
    $('.images-container .delete-image').on('click', function () {
        var el = $(this);
        var itemContainer = el.parents('.questions-item-container ');
        var commentId = itemContainer.attr('id').split('_')[1];
        var imagePositon = el.data('image-position');

        // Do not allow another image deletion before the last image deletion is over,
        // otherwise it will cause problems.
        if (itemContainer.hasClass('deleting-image')) {
            alert(keywords.anotherImageDeleteInProgress);
            return;
        }

        itemContainer.addClass('deleting-image')

        $.ajax({
            url: localLink + 'modules/gamification/ajax/frontend_ws.php',
            method: 'post',
            dataType: 'json',
            data: {
                action: 'delete_comment_image',
                commentId: commentId,
                imagePosition: imagePositon
            }
        }).done(function (data) {
            if ('success' == data.status) {
                itemContainer.removeClass('deleting-image');

                el.parents('.image-container').remove();
                // Recalculate the image positions for the delete buttons.
                itemContainer.find('.delete-image').each(function (i, obj) {
                    var obj = $(obj);
                    var pos = obj.data('image-position');

                    if (pos > imagePositon) {
                        obj.data('image-position', pos - 1);
                    } else {
                        obj.val('image-position', pos + 1);
                    }
                });
            } else if ('success' == data.status) {
                alert(data.error_msg);
            }
        });
    });

    /**
     * Handle notes images delete.
     */
    $('.images-container .delete-note-image').on('click', function () {
        var el = $(this);
        var itemContainer = el.parents('.questions-item-container ');
        var noteId = itemContainer.attr('id').split('_')[1];
        var imagePositon = el.data('image-position');

        // Do not allow another image deletion before the last image deletion is over,
        // otherwise it will cause problems.
        if (itemContainer.hasClass('deleting-image')) {
            alert(keywords.anotherImageDeleteInProgress);
            return;
        }

        itemContainer.addClass('deleting-image')

        $.ajax({
            url: localLink + 'modules/gamification/ajax/frontend_ws.php',
            method: 'post',
            dataType: 'json',
            data: {
                action: 'delete_note_image',
                noteId: noteId,
                imagePosition: imagePositon
            }
        }).done(function (data) {
            if ('success' == data.status) {
                itemContainer.removeClass('deleting-image');

                el.parents('.image-container').remove();
                // Recalculate the image positions for the delete buttons.
                itemContainer.find('.delete-note-image').each(function (i, obj) {
                    var obj = $(obj);
                    var pos = obj.data('image-position');

                    if (pos > imagePositon) {
                        obj.data('image-position', pos - 1);
                    } else {
                        obj.val('image-position', pos + 1);
                    }
                });
            } else if ('success' == data.status) {
                alert(data.error_msg);
            }
        });
    });

    agendaItem = $('.agenda-item-future');
    if (agendaItem.length > 0) {
        updateAgendaItemHeight();
        $(window).resize(function () {
            updateAgendaItemHeight();
        });
    }
});

function updateAgendaItemHeight() {
    var offset = agendaItem.offset();
    var height = jQuery(window).height()
        - offset.top
        - jQuery('footer').height()
        - jQuery('.agenda-item-rating-container').parents('.row').height();
    agendaItem.css('min-height', height);
}



function setStatusbarColor(color) {

    // If the statusbar font color needs to be black, we just remove the meta tag that's making it white.
    // This has to be done right away, or it doesn't work!!! DO NOT DELAY IT
    // We can't do this on the server because the tag needs to be there when the app is launched to get it to go full screen.
    if (color === "black" && window.navigator.standalone && iOSVersion() < 8) {

        $("meta[name='apple-mobile-web-app-status-bar-style']").remove();

    }

    // On iOS 8, we need to set the statusbar meta tag to "white".  This method is not 100% effective, but may work.
    if (color === "black" && window.navigator.standalone && iOSVersion() >= 8) {
        $("meta[name='apple-mobile-web-app-status-bar-style']").attr("content", "white");
    }
}

// http://stackoverflow.com/a/14223920/339827
function iOSVersion() {
    var match = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);

    // default to version 8
    // otherwise it breaks when switching to desktop mode
    if (!match) {
        return 8;
    }

    // return version
    return parseFloat([
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3] || 0, 10)
    ].join('.'));
}

function hideHomescreenOverlay() {
    $(".app-overlay").removeClass("show");
}

function showHomescreenOverlay() {
    $('body').toggleClass('locked');
    $(".app-overlay").addClass("show");
}

$(function () {
    $.stayInWebApp();

    // setStatusbarColor("white");

    // Mobile Safari in standalone mode
    if (("standalone" in window.navigator) && window.navigator.standalone) {
        $(".app-overlay").remove();
        $(".show-homescreen-overlay").remove();
    }

    $(document).on('touchmove', '.app-overlay', function (event) {
        event.preventDefault();
    });

    autoResizeTextarea();
});

$(window).on("orientationchange", function (event) {
});

// Autoresize textarea
function autoResizeTextarea() {
    $('.questions-container .questions-filter-items .form-group textarea').each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        console.log(this.scrollHeight);
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

$(window).resize(function () {
    $('.questions-container .questions-filter-items .form-group textarea').each(function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});
function refreshPage() {
    window.location = window.location;
}

function refreshCountdown() {
    var t = new Date();
    t.setSeconds(t.getSeconds() + 5);
    $('#countdown').countdown({until: t, onExpiry: refreshPage, format:'s', compact: true});
}