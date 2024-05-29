var Form = {
    step: 1,
    modal: $('#step_1'),
    redirectAfterLead: false,
    exitModalActive: false,
    redirectToUrl: '',
    init: function () {

        ga4Analytics.init(multitest, variacao);
        ga4Analytics.tlid = tlid;
        // ga4Analytics.debug = true;
        ga4Analytics.view();

        // Configura modal
        $('.open-form').click(function (ev) {
            ev.preventDefault();
            Form.showModal();
        });

        if (versaoPagina == 'af') {
            $('#js-mascara').removeClass('js-modal-bg-default').addClass('js-modal-bg-af');
            Form.showModal();
        }

        if (versaoPagina == 'g') {
            Form.showModal();
            $('.btn-close-modal').hide();
        }
        Form.setup();
        Form.popupAtivo();
    },
    setup: function () {
        $('form').each(function () {
            // jQuery.validator.setDefaults({
            //     debug: true
            // });
            $(this).validate({
                rules: {
                    nome: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true,
                        minlength: 5
                    }
                },
                messages: {
                },
                ignoreTitle: true,
                errorElement: "div",
                errorPlacement: function (error, element) {
                    // invalid-feedback ou invalid-tooltip
                    error.addClass("invalid-tooltip input-error-msg");
                    if (["checkbox", "radio"].indexOf(element.prop("type")) !== -1) {
                        error.insertAfter(element.parent().parent());
                    } else {
                        error.insertAfter(element);
                    }
                    ga4Analytics.error('Step ' + Form.step + '|' + error[0].innerText + '|' + element.prop('id'));
                },
                submitHandler: function (form) {
                    if (!Form.step) {
                        console.log('Step not found');
                        return false;
                    }
                    Form.showLoading();
                    if ($(form).attr('pularpara')) {
                        Form.goToStep($(form).attr('pularpara'));
                    } else {
                        Form.submit(form);
                    }
                }
            });
        });
    },
    submit: function (form) {
        var data = {};
        $.each($(form).serializeArray(), function (i, d) {
            data[d.name] = d.value;
        });
        $.ajax({
            url: 'submit?step=' + Form.step + '&variation=' + variacao,
            dataType: 'json',
            type: 'POST',
            data: data,
            success: function (data) {
                Form.hideLoading();
                $('input[name=uuid]').val(data.uuid || "");

                if (data.success) {
                    if (data.pixels) {
                        $('body').append(data.pixels.join(' '));
                    }

                    if (data.conversao) {
                        Form.conversao = data.conversao;
                        ga4Analytics.conversion();
                    }

                    Form.goToStep(data.goToStep);
                } else {
                    Form.showError(data.message);
                }
            },
            error: function () {
                Form.hideLoading();
                Form.showError($.validator.messages.genericError);
            }
        });
    },
    goToStep: function (step) {
        ga4Analytics.changeStep(step);

        var stepEl = $('#step_' + step);
        if (stepEl.length === 0) {
            console.log('Step not found');
            return;
        }

        // o framework  adiciona na lp redirecionaPosLead e redirecionaUrl
        if (step === 'comentario') {
            var interagiuComForm = false;
            $('#comentario').on('focus', function () {
                interagiuComForm = true;
            });

            setTimeout(function () {
                if (redirecionaPosLead && !interagiuComForm) {
                    window.location.href = redirecionaUrl
                }
            }, 7000);
        }

        if (step === 'sucesso' && redirecionaPosLead) {
            setTimeout(function () {
                window.onbeforeunload = null
                window.location.href = redirecionaUrl
            }, 3000);
        }

        Form.modal.hide();
        Form.modal = stepEl;
        Form.modal.fadeIn(300);
        Form.step = step;
        Form.scrollTo(stepEl);
    },
    hideErrors: function () {
        $('div.errors').html('').hide();
        $('.error').removeClass('error');
    },
    showError: function (msg) {
        Form.modal.find('div.errors').html('<label class="error">' + msg + '</label>').show();
        ga4Analytics.error(msg);
    },
    scrollTo: function (element) {
        $('html,body').animate({
            'scrollTop': $(element).offset().top - 40
        }, 'slow');
    },
    showLoading: function () {
        if (Form.modal.find('.js-loading-msg').length === 0) {
            Form.modal.find(':input[type=submit]').after('<div class="text-center js-loading-msg"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>\n' +
                '<span class="sr-only">Loading...</span></div>').hide();
        }
    },
    hideLoading: function () {
        Form.modal.find(':input[type=submit]').show();
        Form.modal.find('.js-loading-msg').remove();
    },
    showModal: function () {
        Form.scrollTo('body');
        $('body').addClass('js-modal-active');
        $('#js-mascara').append('<a class="btn-close-modal" title="Fechar">&times;</a>').show();
        $('#form').addClass('js-form-modal js-scale-up-right');
        $('#js-form-container').removeClass('col-lg-4');
        $('.btn-close-modal').click(function (ev) {
            ev.preventDefault();
            Form.closeModal();
        });
    },
    closeModal: function () {
        $('body').removeClass('js-modal-active');
        $('#form').removeClass('js-form-modal js-scale-up-right');
        $('#js-form-container').addClass('col-lg-4');
        $('.btn-close-modal').remove();
        $('#js-mascara').hide();
    },
    showExitModal: function () {
        if (Form.exitModalActive) return false;
        Form.exitModalActive = true;
        Form.scrollTo('body');
        $('body').addClass('js-modal-active');
        $('#js-mascara').append('<a class="btn-close-modal" title="Fechar">&times;</a>').show();
        $('#form').addClass('js-form-modal js-scale-up-right');
        $('#js-form-container').removeClass('col-lg-4');
        $('.btn-close-modal').click(function (ev) {
            ev.preventDefault();
            Form.closeExitModal();
        });
    },
    closeExitModal: function () {
        Form.exitModalActive = false;
        $('body').removeClass('js-modal-active');
        $('#form').removeClass('js-form-modal js-scale-up-right');
        $('#js-form-container').addClass('col-lg-4');
        $('.btn-close-modal').remove();
        $('#js-mascara').hide();
    },
    popupAtivo: function () {
        if (popupAtivo) {
            window.onbeforeunload = function (evt) {
                return true;
            }
        }
    }
};
$(function () {
    Form.init();
});
