function UtilityBar() {}
;(function () {
  var THIS = this
  var $j = jQuery
  this.defined = function (x) {
    return typeof x != 'undefined'
  }
  this.ready = false
  this.init = function (params) {
    this.ready = true

    options = THIS.services.getOptions()

    THIS.set('language', params.language)

    // SET AUTO EXPAND
    if (params.product !== undefined && params.product !== '') {
      THIS.set('product', params.product)
    }

    // SET AUTO EXPAND
    if (params.auto_expand !== undefined && params.auto_expand !== '') {
      THIS.set('auto_expand', params.auto_expand)
    }

    // SET CONTEXT
    if (params.colorscheme !== undefined && params.colorscheme !== '') {
      THIS.set('colorscheme', params.colorscheme)
    }
    $j('.generic_links').addClass('generic_links_' + params.colorscheme)
    $j('.generic_links_small').addClass('generic_links_small_' + params.colorscheme)

    // SET CONTEXT
    if (params.context !== undefined && params.context !== '') {
      THIS.set('context', params.context)
    }

    // SET USER TYPE
    if (params.user_type_override !== undefined && params.user_type_override !== '') {
      THIS.set('user_type', params.user_type_override)
    } else {
      THIS.set('user_type', core.user.userType())
    }

    // SET SUBSCRIPTION
    if (params.subscription_override !== undefined && params.subscription_override !== '') {
      THIS.set('subscription', params.subscription_override)
    } else {
      THIS.set('subscription', core.user.subscription_level())
    }

    /*core.services.debugMessage({
            'title': 'Utility bar',
            'message': 'Loaded',
            'objects' : {
                'user_type' : THIS.get('user_type'),
                'context' : THIS.get('context'),
                'subscription' : THIS.get('subscription'),
                'loggedIn' : core.user.loggedIn(),
                'permissions' : core.user.permissions(),
                'colorscheme' : THIS.get('colorscheme')
            }
        });*/

    THIS.define.inputs({})

    if (params.onSuccess !== undefined) {
      params.onSuccess()
    }

    //$j('#keyword').focus();

    THIS.toggle.initial_panel_state({})

    THIS.define.events()
  }
  this.get = function (key) {
    return options[key]
  }
  this.set = function (key, value) {
    if (THIS.defined(options[key])) {
      options[key] = value
    }
  }
  var options = {}
  this.callbacks = {
    accountLinked: function (json) {
      // IF COMING FROM SSO AND REQUIRED TEACHER VALIDATION, CONTINUE ON THE SSO FLOW
      var sso_params = core.user.sso()
      if (sso_params !== undefined && sso_params.action !== undefined && sso_params.action === 'validate_teacher_login') {
        window.location.href = core.fetch.path('sso_login_validated', {})
      } else {
        var username = '',
          password = ''
        if ($j('#educator_username').val() !== '' && $j('#educator_password').val() !== '') {
          username = $j('#educator_username').val()
          password = $j('#educator_password').val()
        } else {
          if ($j('#verify_educator_username').val() !== '' && $j('#verify_educator_password').val() !== '') {
            username = $j('#verify_educator_username').val()
            password = $j('#verify_educator_password').val()
          }
        }
        if (json.state != '0') {
          THIS.callbacks.accountLinkedFailed(json)
        } else {
          if (username !== '' && password !== '') {
            // AUTO LOGIN
            core.persistentData.set(
              {
                open_panel: 'edu_account_linked'
              },
              true
            )
            core.persistentData.set(
              {
                school_name: THIS.get('school_name')
              },
              true
            )
            if (core.user.loggedIn()) {
              core.accounts.logout({
                async: true,
                onSuccess: function (json) {
                  THIS.services.login({
                    username: username,
                    password: password
                  })
                },
                onFailure: function (json) {}
              })
            } else {
              THIS.services.login({
                username: username,
                password: password
              })
            }
          } else {
            if (core.user.loggedIn()) {
              //core.persistentData.set({'open_panel' : 'edu_account_linked'}, true);
              core.persistentData.set(
                {
                  school_name: THIS.get('school_name')
                },
                true
              )
              core.accounts.logout({
                async: true,
                onSuccess: function (json) {
                  THIS.toggle.panelByName({
                    panel_name: 'edu_account_linked'
                  })
                  $j('#edu_account_linked_relogin_message').show('slow', function () {
                    $j('#edu_linked_login_link').off()
                    $j('#edu_linked_login_link').on('click', function (event) {
                      THIS.toggle.panelByName({
                        panel_name: 'login'
                      })
                      event.preventDefault()
                    })
                  })
                },
                onFailure: function (json) {}
              })
            } else {
              THIS.set('edu_acct_id', '')
              THIS.set('school_acct_id', '')
              THIS.set('code', '')
              THIS.toggle.panelByName({
                panel_name: 'edu_account_linked'
              })
            }
          }
        }
      }
    },
    accountLinkedFailed: function (json) {
      $j('.frm_verify_educator_login_errors').hide()
      $j('#school_username, #school_password').val('')
      $j('#verify_school_login_submit, #educator_verify_account').removeClass('disabled')
      THIS.set('edu_acct_id', '')
      THIS.set('school_acct_id', '')
      THIS.set('code', '')
      switch (json.state) {
        case 25:
          $j('#verify_educator_username').focus()
          $j('#accounts_already_linked_error_placeholder').fadeIn()
          break
        default:
          THIS.toggle.error(json)
          break
      }
    },
    accountLoginConfirmed: function (json) {
      var login = true
      if (json.state != '0') {
        THIS.callbacks.accountLoginConfirmationFailed(json)
        login = false
      } else {
        $j('#frm_username').val($j('#username').val())
        $j('#frm_password').val($j('#password').val())

        // link_educator MEANS THIS IS AN EDUCATORS ONLY LOGIN AND WHEN SUCCESSFUL, IT SHOULD REDIRECT TO THE LINKING STAGE
        if (THIS.get('link_educator') == 'yes') {
          if (json.educator == 'false') {
            // WRONG ACCOUNT TYPE
            THIS.callbacks.accountLoginConfirmationFailed(json)
            login = false
          } else {
            // LOGIN TO EDUCATORS PASSED
            $j('#frm_refer').val(
              core.fetch.path('link-bp-account', {
                aid: json.EntryID
              })
            )
          }
        }
        if (THIS.get('force_login_type') === 'student_or_educator' && json.user_type !== 'student' && json.user_type !== 'educator') {
          THIS.callbacks.accountLoginConfirmationFailed(json)
          login = false
        }
        if (login === true) {
          if (core.user.loggedIn()) {
            core.accounts.logout({
              async: true,
              onSuccess: function (json) {
                THIS.services.login({
                  username: $j('#username').val(),
                  password: $j('#password').val()
                })
              },
              onFailure: function (json) {}
            })
          } else {
            THIS.services.login({
              username: $j('#username').val(),
              password: $j('#password').val()
            })
          }
        }
      }
    },
    accountLoginConfirmationFailed: function (json) {
      $j('#perform_login').removeClass('disabled')
      switch (json.state) {
        case '0':
          if (THIS.get('link_educator') == 'yes' && json.educator == 'false') {
            // LOGIN VERIFIED BUT THIS IS AN EDUCATORS LOGIN ONLY
            $j('#login_not_an_educator_account_error_placeholder').fadeIn()
          } else if (THIS.get('force_login_type') === 'student_or_educator' && json.user_type !== 'student' && json.user_type !== 'educator') {
            $j('#login_not_an_indi_account_error_placeholder').fadeIn()
          }
          break
        case 2:
          // EXPIRED
          $j('#login_generic_error_placeholder').html(THIS.services.getErrorMessage(json)).fadeIn()
          break
        case 3:
          $j('#login_generic_error_placeholder')
            .html(core.translations.get('error_account_not_active', THIS.get('tcontext')))
            .fadeIn()
          if (json.EntryID !== undefined && json.user_type == 'educator') {
            $j('#resend_activation_email').show()
            THIS.set('acct_id', json.EntryID)
            $j('#resend_activation_email').off()
            $j('#resend_activation_email').on('click', function (event) {
              core.accounts.sendActivationEmail({
                async: true,
                language: THIS.get('language'),
                EntryID: THIS.get('acct_id'),
                onSuccess: function (json) {
                  $j('#login_generic_error_placeholder').hide()
                  $j('#activation_email_resent_placeholder').fadeIn()
                },
                onFailure: function (json) {}
              })
              event.preventDefault()
            })
          }
          break
        case 4:
          // NON LINKED EDUCATORS ACCOUNT
          $j('#login_non_linked_educators_error_placeholder').fadeIn()
          break
        case 5:
          // WRONG PASSWORD
          $j('#login_bad_login_error_placeholder').fadeIn()
          break
        case 34:
          // NO SUBSCRIPTION FOR PRODUCT
          $j('#subscription_has_no_access_to_product').fadeIn()
          break
        default:
          $j('#login_bad_login_error_placeholder').fadeIn()
          //$j('#login_generic_error_placeholder').html(THIS.services.getErrorMessage(json)).fadeIn();
          break
      }
    },
    codeRequestSent: function (json) {
      $j('#code_request_send').removeClass('disabled')
      $j('#code_request_first_name, #code_request_last_name, #code_request_email').val('')
      THIS.toggle.panelByName({
        panel_name: 'help_educator_get_code_step3'
      })
    },
    codeValidated: function (json) {
      if (json.state != 'valid') {
        THIS.callbacks.codeValidationFailed(json)
      } else {
        THIS.set('code', json.code)
        var create_url = ''
        var sso = core.user.sso()

        // LOOK FOR SSO ACTION OVERRIDE PARAM
        if (THIS.get('sso_action_override') !== '') {
          sso.action = THIS.get('sso_action_override') // OVERRIDE SSO ACTION
          THIS.set('sso_action_override', '') // RESET THE OVERRIDE
        }

        if (sso.action !== undefined && sso.action !== null && sso.action !== '') {
          if (sso.action === 'auto_create_unknown' || sso.action === 'fake_unknown') {
            if (THIS.get('i_am_a') === 'student') {
              sso.action = 'auto_create_student'
              //THIS.set('class_id', json.class_id);
              //THIS.set('class_name', json.class_name);
              //THIS.services.processStudent();
            } else if (THIS.get('i_am_a') === 'teacher') {
              sso.action = 'auto_create_teacher'
            }
          }

          switch (sso.action) {
            case 'auto_create_student':
              if (json.type != 'class') {
                $j('#code_not_class_placeholder').fadeIn()
                $j('#validate_code').removeClass('disabled')
              } else {
                create_url = core.fetch.path('sso_create_student', {
                  class_id: json.class_id
                })
                if (core.user.missingSSOInfo('student')) {
                  THIS.set('sso_missing_info', {
                    url: create_url,
                    type: 'student'
                  })
                  THIS.toggle.panelByName({
                    panel_name: 'sso_missing_info'
                  })
                } else {
                  window.location.href = create_url
                }
              }
              break
            case 'auto_create_teacher':
              if (json.type != 'educator') {
                $j('#code_not_school_placeholder').fadeIn()
                $j('#validate_code').removeClass('disabled')
              } else {
                THIS.set('tmp', json)
                THIS.toggle.panelByName({
                  panel_name: 'sso_terms_of_use'
                })
              }
              break
            case 'process_student':
              if (json.type === 'class') {
                THIS.set('class_id', json.class_id)
                THIS.set('class_name', json.class_name)
                THIS.services.processStudent()
              } else {
                $j('#code_not_class_placeholder').fadeIn()
                $j('#validate_code').removeClass('disabled')
              }
              break
          }
        } else {
          if (THIS.get('sso_action') !== '') {
            switch (THIS.get('sso_action')) {
              case 'register_student':
                if (json.type != 'class') {
                  $j('#code_not_class_placeholder').fadeIn()
                  $j('#validate_code').removeClass('disabled')
                } else {
                  create_url = core.fetch.path('sso_create_student', {
                    class_id: json.class_id
                  })
                  if (core.user.missingSSOInfo('student')) {
                    THIS.set('sso_missing_info', {
                      url: create_url,
                      type: 'student'
                    })
                    THIS.toggle.panelByName({
                      panel_name: 'sso_missing_info'
                    })
                  } else {
                    window.location.href = create_url
                  }
                }
                break
              case 'register_educator':
                if (json.type != 'educator') {
                  $j('#code_not_school_placeholder').fadeIn()
                  $j('#validate_code').removeClass('disabled')
                } else {
                  THIS.set('school_contact_name', '')
                  THIS.set('school_name', '')
                  THIS.set('school_acct_id', '')
                  THIS.services.processSchool()
                }
                break
            }
          } else {
            $j('#validate_code').removeClass('disabled')
            switch (json.type) {
              case 'educator':
                /*THIS.set('school_contact_name', '');
                                THIS.set('school_name', '');
                                THIS.set('school_acct_id', '');
                                THIS.services.processSchool();*/
                if (core.user.loggedIn() && core.user.userType() === 'teacher') {
                  THIS.set('school_contact_name', json.school_contact_name)
                  THIS.set('school_name', json.school_name)
                  THIS.set('school_acct_id', json.id)
                  THIS.services.processSchool()
                } else {
                  window.location.href = core.fetch.path('register-educator', {})
                }
                break
              case 'class':
                if (core.user.loggedIn() && core.user.userType() == 'student' && core.user.isOrphan() === 'yes' && json.maxed_reached === 'true') {
                  // LOGGED ON ORPHAN STUDENT, SHOW MAX ENROLMENT MESSAGE
                  $j('#class_code_enrollment_limit_reached_placeholder').fadeIn()
                } else {
                  // NOT LOGGED IN. PROCESS NORMALLY.
                  THIS.set('class_id', json.class_id)
                  THIS.set('class_name', json.class_name)
                  THIS.set('maxed_enr_reached', json.maxed_reached)
                  THIS.services.processStudent()
                }
                break
              default:
                $j('#code_error_placeholder').fadeIn()
                break
            }
          }
        }
      }
    },
    codeValidationFailed: function (json) {
      if (json.reason == 'school_code') {
        $j('#code_is_educators_error_placeholder').fadeIn()
      } else {
        core.services.getErrorCodes({
          onSuccess: function (errors) {
            switch (json.error_code) {
              case errors.SUBSCRIPTION_NOT_ELIGIBLE_4_MYBRAINPOP:
                $j('#code_not_eligible_error_placeholder').fadeIn()
                break
              case errors.SUBSCRIPTION_ALREADY_LINKED_TO_ACCOUNT:
                $j('#code_reused_error_placeholder').fadeIn()
                break
              case errors.CLASS_CODE_EXPIRED:
                $j('#code_expired_placeholder').fadeIn()
                break
              case errors.CODE_IS_FOR_ARCHIVED_CLASS:
                $j('#code_archived_placeholder').fadeIn()
                break
              case errors.SCHOOL_REACHED_ENROLLMENT_LIMIT:
                if (json.type === 'class') {
                  $j('#code_enrollment_limit_reached_students_placeholder').fadeIn()
                } else {
                  $j('#code_enrollment_limit_reached_placeholder').fadeIn()
                }
                break
              case errors.ACCOUNT_EXPIRED:
                $j('#code_account_expired_placeholder').fadeIn()
                break
              case errors.MYBP_DISABLED_FOR_ACCOUNT:
                $j('#code_mybp_disabled').fadeIn()
                break
              default:
                $j('#code_error_placeholder').fadeIn()
                break
            }
          }
        })
      }
      $j('#validate_code').removeClass('disabled')
    },
    educatorsAccountLoginConfirmed: function (json) {
      if (json.state != '0') {
        THIS.callbacks.educatorsAccountLoginConfirmationFailed(json)
      } else {
        if (json.educator == 'false') {
          $j('#educator_login_account_error_placeholder').fadeIn()
          $j('#perform_educator_login').removeClass('disabled')
        } else {
          var aid = json.EntryID

          // 1. LOG THE USER OUT
          core.accounts.logout({
            async: true,
            onSuccess: function (json) {
              // 2. AFTER LOGGING HIM OUT, LOG HIM IN WITH HIS EDUCATORS ACCOUNT. LOGIN REFER SHOULD BE SET FOR THE EDUCATORS REGISTRATION PAGE, STEP 2
              THIS.services.login({
                username: $j('#educator_username').val(),
                password: $j('#educator_password').val(),
                refer: core.fetch.path('link-bp-account', {
                  aid: aid
                })
              })
            },
            onFailure: function (json) {}
          })
        }
      }
    },
    educatorsAccountLoginConfirmationFailed: function (json) {
      $j('#educator_login_generic_error_placeholder').fadeIn()
      $j('#perform_educator_login').removeClass('disabled')
    },
    educatorCodeValidated: function (json) {
      if (json.state != 'valid') {
        THIS.callbacks.educatorCodeValidationFailed(json)
      } else {
        $j('#verify_educators_code').removeClass('disabled')
        if (json.type == 'educator') {
          if (core.user.loggedIn() && core.user.userType() === 'teacher') {
            THIS.set('code', json.code)
            THIS.set('school_contact_name', json.school_contact_name)
            THIS.set('school_name', json.school_name)
            THIS.set('school_acct_id', json.id)
            THIS.services.processSchool()
          } else {
            window.location.href = core.fetch.path('register-educator', {})
          }
        } else {
          $j('#educator_code_verification_failed_not_edu_error_placeholder').fadeIn()
        }
      }
    },
    educatorCodeValidationFailed: function (json) {
      $j('#verify_educators_code').removeClass('disabled')
      switch (json.state) {
        default:
          $j('#educator_code_verification_failed_error_placeholder').fadeIn()
          break
      }
    },
    educatorsLinkAccountSuccessful: function (json) {
      if (json.state != '0' && json.state != '15') {
        // 15: an already linked account
        THIS.callbacks.educatorsLinkAccountFailed(json)
      } else {
        // LOG IN USING THE EDUCATOR ACCOUNT LOGIN BUT FIRST WE MUST LOGOUT
        $j('#educator_link_account_success_message_placeholder')
          .css('top', $j('#perform_educator_login').position().top + 'px')
          .fadeIn()
        $j('body').css('cursor', 'progress')
        core.accounts.logout({
          async: true,
          onSuccess: function (json) {
            THIS.services.login({
              username: $j('#educator_username').val(),
              password: $j('#educator_password').val()
            })
          },
          onFailure: function (json) {}
        })
      }
    },
    educatorsLinkAccountFailed: function (json) {
      switch (json.state) {
        case 14:
          $j('#educator_link_account_error_placeholder')
            .html(core.translations.get('not_an_educator_account', THIS.get('tcontext')))
            .css('top', $j('#perform_educator_login').position().top + 'px')
            .fadeIn()
          break
        case 15:
          //$j('#educator_link_account_error_placeholder').html(core.translations.get('educators_account_already_linked', THIS.get('tcontext'))).css('top', $j('#perform_educator_login').position().top+'px').fadeIn();
          break
        case 16:
          $j('#educator_link_account_error_placeholder')
            .html(core.translations.get('educators_account_self_link_attempt', THIS.get('tcontext')))
            .css('top', $j('#perform_educator_login').position().top + 'px')
            .fadeIn()
          break
        default:
          $j('#educator_link_account_error_placeholder')
            .html(core.translations.get('educators_link_failed', THIS.get('tcontext')))
            .css('top', $j('#perform_educator_login').position().top + 'px')
            .fadeIn()
      }
      $j('#perform_educator_login').removeClass('disabled')
    },
    educatorLoginConfirmed: function (json) {
      if (json.state != '0') {
        THIS.callbacks.educatorLoginConfirmationFailed(json)
      } else {
        $j('#verify_educator_login_submit').removeClass('disabled')
        $j('#educator_username, #educator_password').val('')
        switch (THIS.get('action')) {
          case 'code_help':
            THIS.toggle.panelByName({
              panel_name: 'help_educator_get_code_step2'
            })
            break
          default:
            if (json.educator == 'false') {
              $j('#educator_login_not_educator_account_error_placeholder').fadeIn()
            } else {
              THIS.set('edu_acct_id', json.EntryID)
              var sso_params = core.user.sso()
              var school_id = ''

              // SSO OVERRIDES
              var sso_district = ''
              if (sso_params !== undefined && sso_params.action !== undefined && sso_params.action === 'validate_teacher_login') {
                THIS.set('school_acct_id', sso_params.parent_account_id)
                THIS.set('code', sso_params.parent_school_code)
                THIS.set('school_name', json.school_name)
                sso_district = sso_params.district
              }

              if (json.already_linked === 'true' && THIS.get('school_acct_id') != json.parent_id && sso_district != 'Yes') {
                // MEANS THIS EDUACTOR ACCOUNT ALREADY HAS AN ACCOUNT AND IF WE RELINK HIM ALL OLD DATA WILL BE REMOVED.
                THIS.toggle.panelByName({
                  panel_name: 'educators_relink_confirmation'
                })
                /*if(THIS.get('school_acct_id')===json.parent_id){
                                    // ALREADY LINKED TO CURRENT PARENT
                                    THIS.toggle.panelByName({
                                        'panel_name' : 'educators_already_linked_to_parent'
                                    });
                                }else{
                                    // MEANS THIS EDUACTOR ACCOUNT ALREADY HAS AN ACCOUNT AND IF WE RELINK HIM ALL OLD DATA WILL BE REMOVED.
                                    THIS.toggle.panelByName({
                                        'panel_name' : 'educators_relink_confirmation'
                                    });
                                }*/
              } else {
                if (sso_params !== undefined && sso_params.action !== undefined && sso_params.action === 'validate_teacher_login') {
                  if (sso_params.teacher_account_id == json.EntryID) {
                    // VALID LOGIN
                    if (sso_district == 'Yes') {
                      window.location.href = core.fetch.path('sso_login', {
                        educator: 'true'
                      })
                    } else {
                      window.location.href = core.fetch.path('sso_login_validated', {})
                    }
                  } else {
                    // BAD LOGIN FOR THIS ACCOUNT
                    if (sso_params.sso_provisioned == 'No') {
                      $j('#educator_login_generic_error_placeholder').fadeIn()
                    } else {
                      $j('#educator_login_token_error_placeholder').fadeIn()
                    }
                  }
                } else {
                  THIS.services.linkAccount() // DIRECTLY LINK THE ACCOUNT
                }
              }
            }
            break
        }
      }
    },
    educatorLoginConfirmationFailed: function (json) {
      var sso_params = core.user.sso()
      if (sso_params !== undefined && sso_params.action !== undefined && sso_params.action === 'validate_teacher_login' && sso_params.sso_provisioned == 'Yes') {
        $j('#verify_educator_token_submit').removeClass('disabled')
        switch (json.state) {
          default:
            $j('#educator_login_token_error_placeholder').fadeIn()
            break
        }
      } else {
        $j('#verify_educator_login_submit').removeClass('disabled')
        switch (json.state) {
          default:
            $j('#educator_login_generic_error_placeholder').fadeIn()
            break
        }
      }
    },
    educatorLoginVerified: function (json) {
      if (json.state != '0') {
        THIS.callbacks.educatorLoginConVerificationFailed(json)
      } else {
        if (json.educator == 'false') {
          $j('#educator_verify_account').removeClass('disabled')
          $j('#verify_educator_login_not_educator_account_error_placeholder').fadeIn()
        } else {
          THIS.set('edu_acct_id', json.EntryID)
          if (json.already_linked === 'true') {
            // IF ALREADY LINKED, ONLY SHOW RELINK WARNING IF NOT ALREADY LINKED TO SAME PARENT CURRENT CODE SUGGESTS..
            if (THIS.get('school_acct_id') === json.parent_id) {
              // ALREADY LINKED TO CURRENT PARENT
              THIS.toggle.panelByName({
                panel_name: 'educators_already_linked_to_parent'
              })
            } else {
              // MEANS THIS EDUACTOR ACCOUNT ALREADY HAS AN ACCOUNT AND IF WE RELINK HIM ALL OLD DATA WILL BE REMOVED.
              THIS.toggle.panelByName({
                panel_name: 'educators_relink_confirmation'
              })
            }
          } else {
            // DIRECTLY LINK THE ACCOUNT
            THIS.services.linkAccount()
          }
        }
      }
    },
    educatorLoginConVerificationFailed: function (json) {
      $j('#educator_verify_account').removeClass('disabled')
      switch (json.state) {
        default:
          $j('#verify_educator_login_generic_error_placeholder').fadeIn()
          break
      }
    },
    orphanStudentCodeValidated: function (json) {
      if (json.state != 'valid') {
        THIS.callbacks.orphanStudentCodeValidatFailed(json)
      } else {
        switch (json.type) {
          case 'class':
            if (core.user.loggedIn() && core.user.userType() == 'student' && core.user.isOrphan() === 'yes' && json.maxed_reached === 'true') {
              $j('#orphan_studentcode_enrollment_limit_reached_placeholder').fadeIn()
              $j('#verify_orphan_student_code').removeClass('disabled')
            } else {
              core.accounts.addStudentToClass({
                async: true,
                class_id: json.class_id,
                student_id: core.user.id(),
                code: json.code,
                onSuccess: function () {
                  THIS.set('class_name', json.class_name)
                  core.accounts.logout({
                    async: true,
                    onSuccess: function (json) {
                      THIS.toggle.panelByName({
                        panel_name: 'orphan_student_joined'
                      })
                    },
                    onFailure: function (json) {}
                  })
                },
                onFailure: THIS.callbacks.studentJoinedClassFailed
              })
            }
            break
          default:
            THIS.callbacks.orphanStudentCodeValidatFailed(json)
            break
        }
      }
    },
    orphanStudentCodeValidatFailed: function (json) {
      $j('#verify_orphan_student_code').removeClass('disabled')
      switch (json.reason) {
        case 'school_code':
          $j('#orphan_student_code_verification_failed_not_student_error_placeholder').fadeIn()
          break
        default:
          $j('#orphan_student_code_verification_failed_error_placeholder').fadeIn()
          break
      }
    },
    orphanStudentLoginConfirmed: function (json) {
      if (json.state != '0') {
        THIS.callbacks.orphanStudentLoginConfirmationFailed(json)
      } else {
        if (json.user_type != 'student') {
          $j('#orphan_student_login_not_student_account_error_placeholder').fadeIn()
          $j('#orphan_student_login_submit').removeClass('disabled')
        } else {
          THIS.services.login({
            username: $j('#orphan_student_username').val(),
            password: $j('#orphan_student_password').val()
          })
        }
      }
    },
    orphanStudentLoginConfirmationFailed: function (json) {
      $j('#orphan_student_login_submit').removeClass('disabled')
      switch (json.state) {
        default:
          $j('#orphan_student_login_generic_error_placeholder').fadeIn()
          break
      }
    },
    passwordChanged: function (json) {
      if (json.state != '0') {
        THIS.callbacks.passwordChangeFailed(json)
      } else {
        core.accounts.logout({
          async: true,
          onSuccess: function (json) {
            THIS.toggle.panelByName({
              panel_name: 'changed_password'
            })
          },
          onFailure: function (json) {}
        })
      }
    },
    passwordChangeFailed: function (json) {
      $j('.change_password_errors').hide()
      $j('#change_password_error_placeholder').fadeIn()
      $j('#update_password').removeClass('disabled')
    },
    schoolLoginConfirmed: function (json) {
      if (json.state != '0') {
        THIS.callbacks.schoolLoginConfirmationFailed(json)
      } else {
        if (json.premium == 'false') {
          $j('#help_me_get_code_school_login').removeClass('disabled')
          $j('#school_login_not_school_account_error_placeholder').fadeIn()
          $j('#verify_school_login_submit').removeClass('disabled')
        } else {
          THIS.set('school_contact_name', json.school_contact_name)
          THIS.set('school_name', json.school_name)
          THIS.set('school_acct_id', json.EntryID)
          THIS.services.processSchool()
        }
      }
    },
    schoolLoginConfirmationFailed: function (json) {
      $j('#verify_school_login_submit').removeClass('disabled')
      switch (json.state) {
        case 2:
          $j('#school_expired_error_placeholder').fadeIn()
          break
        default:
          $j('#school_login_generic_error_placeholder').fadeIn()
          break
      }
    },
    studentCodeValidated: function (json) {
      if (json.state != 'valid') {
        THIS.callbacks.studentCodeValidationFailed(json)
      } else {
        $j('#verify_student_code').removeClass('disabled')
        if (json.type == 'class') {
          THIS.set('class_id', json.class_id)
          THIS.set('class_name', json.class_name)
          THIS.set('code', json.code)
          THIS.services.processStudent()
        } else {
          $j('#student_code_verification_failed_not_student_error_placeholder').fadeIn()
        }
      }
    },
    studentCodeValidationFailed: function (json) {
      $j('#verify_student_code').removeClass('disabled')
      switch (json.state) {
        default:
          $j('#student_code_verification_failed_error_placeholder').fadeIn()
          break
      }
    },
    studentJoinedClass: function (json) {
      if (core.user.loggedIn() && core.user.userType() == 'student') {
        if (core.user.isOrphan() == 'yes') {
          core.accounts.logout({
            async: true,
            onSuccess: function (json) {
              THIS.toggle.panelByName({
                panel_name: 'student_joined_class'
              })
              $j('#relogin_4_changes_to_take_place').show()

              $j('#relogin_4_changes_login').off()
              $j('#relogin_4_changes_login').on('click', function (event) {
                THIS.toggle.panelByName({
                  panel_name: 'login'
                })
              })
            },
            onFailure: function (json) {}
          })
        } else {
          THIS.toggle.panelByName({
            panel_name: 'student_joined_class'
          })
        }
      } else {
        core.persistentData.set(
          {
            open_panel: 'student_joined_class'
          },
          true
        )
        core.persistentData.set(
          {
            class_name: THIS.get('class_name')
          },
          true
        )

        if (core.user.loggedIn()) {
          core.accounts.logout({
            async: true,
            onSuccess: function (json) {
              THIS.services.login({
                username: $j('#student_username').val(),
                password: $j('#student_password').val()
              })
            },
            onFailure: function (json) {}
          })
        } else {
          THIS.services.login({
            username: $j('#student_username').val(),
            password: $j('#student_password').val()
          })
        }
      }
    },
    studentJoinedClassFailed: function (jqXHR, textStatus, errorThrown) {
      var json = JSON.parse(jqXHR.responseText)
      switch (json.error) {
        case 'too_many_linked_accounts':
          $j('#student_link_no_room_error_placeholder').fadeIn()
          break
        default:
          break
      }
      $j('#verify_student_login_submit').removeClass('disabled')
    },
    studentLoginConfirmed: function (json) {
      if (json.state != '0') {
        THIS.callbacks.studentLoginConfirmationFailed(json)
      } else {
        if (json.user_type != 'student') {
          $j('#student_login_not_student_account_error_placeholder').fadeIn()
          $j('#verify_student_login_submit').removeClass('disabled')
        } else {
          if (THIS.get('code') !== '') {
            THIS.set('student_acct_id', json.EntryID)
            if (json.rogue === 'yes') {
              // LOG THE STUDENT IN. THE LOGIN WILL REDIRECT TO THE REGISTRATION PAGE. PASS THE CODE TO THE TEMP SO IT'LL BE PRE POPULATED.
              core.persistentData.set(
                {
                  tmp_code: THIS.get('code')
                },
                true
              )
              THIS.services.login({
                username: $j('#student_username').val(),
                password: $j('#student_password').val()
              })
            } else {
              THIS.services.joinClass() // NOT ROGUE, LINK NOW
            }
          } else {
            if (THIS.get('i_am_a') == 'student') {
              // MEANS WE GOT HERE VIA SSO.
              window.location = '/core/libs/SSO/login.php?username=' + $j('#student_username').val() + '&password=' + $j('#student_password').val()
            } else {
              if (core.user.loggedIn()) {
                core.accounts.logout({
                  async: true,
                  onSuccess: function (json) {
                    THIS.services.login({
                      username: $j('#student_username').val(),
                      password: $j('#student_password').val()
                    })
                  },
                  onFailure: function (json) {}
                })
              } else {
                // LOG IN VIA WEML DIRECTLY
                THIS.services.login({
                  username: $j('#student_username').val(),
                  password: $j('#student_password').val()
                })
              }
            }
          }
        }
      }
    },
    studentLoginConfirmationFailed: function (json) {
      $j('#verify_student_login_submit').removeClass('disabled')
      switch (json.state) {
        default:
          $j('#student_login_generic_error_placeholder').fadeIn()
          break
      }
    },
    teacherAccountUpdated: function (json) {
      if (json.state != '0') {
        THIS.callbacks.teacherAccountUpdateFailed(json)
      } else {
        THIS.toggle.panelByName({
          panel_name: 'teacher_missing_info_updated'
        })
      }
    },
    teacherAccountUpdateFailed: function (json) {
      $j('#update_teacher_info').removeClass('disabled')
      $j('#update_teacher_info_failed_error_placeholder').fadeIn()
    },
    disableDBLClick: function (event) {
      if ($j(this).hasClass('button_already_clicked')) {
        event.stopImmediatePropagation()
      } else {
        $j(this).addClass('button_already_clicked')
        var link = $j(this)
        setTimeout(function () {
          link.removeClass('button_already_clicked')
        }, 1000)
      }
      event.preventDefault()
    }
  }
  this.define = {
    events: function () {
      // ESC SHOULD CLOSE THE PANEL.
      $j(document).on('keyup', function (e) {
        if (e.keyCode === 27) {
          THIS.toggle.panelByName({
            panel_name: THIS.get('panel_open_with')
          })
        }
      })

      // MY BRAINPOP BUTTON CLICK
      $j('#myp_button')
        .on('click', THIS.callbacks.disableDBLClick)
        .on('click', function (event) {
          switch (core.user.userType()) {
            case 'student':
              window.location.href = core.fetch.path('student-view', {})
              break
            case 'teacher':
            case 'educator':
              if (!$j('#myp_button').hasClass('small_button_' + THIS.get('colorscheme') + '_selected')) {
                THIS.toggle.panelByName({
                  panel_name: 'my_brainpop'
                })
              }
              break
          }
          event.preventDefault()
        })

      // LOGIN BUTTON CLICK
      $j('#login_button')
        .on('click', THIS.callbacks.disableDBLClick)
        .on('click', function (event) {
          if (!$j('#login_button').hasClass('small_button_' + THIS.get('colorscheme') + '_selected')) {
            THIS.toggle.panelByName({
              panel_name: 'login'
            })
          }
          event.preventDefault()
        })

      // ENTER CODE BUTTON CLICK
      $j('.enter_code_button')
        .on('click', THIS.callbacks.disableDBLClick)
        .on('click', function (event) {
          var button_id = $j(this).attr('id')
          if (!$j('#' + button_id).hasClass('small_button_' + THIS.get('colorscheme') + '_selected')) {
            THIS.toggle.panelByName({
              panel_name: 'enter_code'
            })
          }
          event.preventDefault()
        })

      // ON LOGOUT BUTTON CLICK
      $j('#logout_button')
        .on('click', THIS.callbacks.disableDBLClick)
        .on('click', function (event) {
          window.location.href = '/user/logout.weml'
          event.preventDefault()
        })

      // ON SEARCH INPUT ENTER CLICK
      $j('#keyword').keyup(function (e) {
        if (e.keyCode == 13) {
          $j('#search_button').trigger('click')
        }
      })

      // ON SEARCH BUTTON CLICK
      $j('#search_button')
        .on('click', THIS.callbacks.disableDBLClick)
        .on('click', function (event) {
          if ($j('#keyword').val() !== '') {
            switch (THIS.get('product')) {
              case 'brainpop':
                $j('#frm_search').attr('action', '/search/')
                break
              case 'brainpopjr':
                $j('#frm_search').attr('action', '/search/')
                break
              case 'brainpopesl':
                $j('#frm_search').attr('action', '/search/')
                break
            }
            $j('#frm_keyword').val($j('#keyword').val())
            $j('#frm_search').submit()
          } else {
            $j('#keyword').focus()
          }
          event.preventDefault()
        })
    },
    inputs: function (params) {
      // SET SEARCH AUTOCOMPLETE
      core.autoComplete.search($j('#keyword'), {
        add_topic_keyword_prefix: false,
        selectFirst: false
      })
    }
  }
  this.toggle = {
    error: function (params) {
      THIS.toggle.panelByName({
        panel_name: 'error_in_process'
      })
      if (params.state !== undefined) {
        $('#error_state').html(params.state)
        $('#error_info_div').show()
      }
      if (params.message !== undefined) {
        $('#error_message').html(params.message)
        $('#error_info_div').show()
      }
    },
    mam_message: function (params) {
      if (core.user.loggedIn()) {
        if (core.user.userType() === 'teacher' || core.user.userType() === 'student') {
          // DO NOTHING
        } else {
          if (THIS.get('subscription') == 'premium') {
            // THIS.toggle.panelByName({panel_name : 'mam_premium_subscription'});
          } else {
            // ONLY IF NOT STUDENT OR TEACHER SHOW THIS MESSAGE
            // THIS.toggle.panelByName({panel_name : 'mam_basic_subscription'});
          }
        }
      } else {
        // THIS.toggle.panelByName({panel_name : 'mam_not_logged_in'});
      }
    },
    initial_panel_state: function (params) {
      if (THIS.get('auto_expand') == 'yes') {
        //console.log(core.persistentData.get('open_panel', true));
        if ($ !== undefined && $.browser !== undefined && $.browser.msie && parseInt($.browser.version, 10) === 8) {
          THIS.toggle.panelByName({
            panel_name: 'ie8_message'
          })
        } else if (core.persistentData.get('open_panel', true) !== '' && core.persistentData.get('open_panel', true) !== undefined && core.persistentData.get('open_panel', true) !== null) {
          THIS.toggle.panelByName({
            panel_name: core.persistentData.get('open_panel', true)
          })
          core.persistentData.set(
            {
              open_panel: ''
            },
            true
          )
        } else if (core.services.getURLParam('panel') !== '') {
          var panel_name = core.services.getURLParam('panel')
          var open_panel = true
          if (panel_name === 'sso_who_are_you' && !core.services.empty(core.persistentData.get('sso_who_are_you_dont_show_again', true))) {
            open_panel = false
            eval('THIS.panels.' + panel_name)().onOpenPrevented()
          } else {
            if (panel_name === 'sso_restricted' && !core.services.empty(core.persistentData.get('sso_restricted_dont_show_again', true))) {
              open_panel = false
              eval('THIS.panels.' + panel_name)().onOpenPrevented()
            }
          }

          // FAKE UNKOWN
          if (panel_name === 'sso_who_are_you') {
            var sso_params = core.user.sso()
            if (sso_params.action == 'fake_unknown') {
              switch (sso_params.user_type) {
                case 'teacher':
                  THIS.set('i_am_a', 'teacher')
                  if (core.user.missingSSOInfo('teacher')) {
                    THIS.toggle.panelByName({
                      panel_name: 'sso_missing_info'
                    })
                  } else {
                    THIS.toggle.panelByName({
                      panel_name: 'enter_code'
                    })
                  }
                  break
                case 'student':
                  THIS.set('i_am_a', 'student')
                  if (core.user.missingSSOInfo('student')) {
                    THIS.toggle.panelByName({
                      panel_name: 'sso_missing_info'
                    })
                  } else {
                    THIS.toggle.panelByName({
                      panel_name: 'sso_i_am_a_student'
                    })
                  }
                  break
              }
              open_panel = false
            }
          }
          // FAKE UNKOWN END

          if (open_panel) {
            THIS.toggle.panelByName({
              panel_name: panel_name
            })
          }
        } else if (THIS.get('context') === 'mam') {
          THIS.toggle.mam_message()
        } else if (core.user.code() !== undefined) {
          // CODE ALREADY ENTERED EARLIER.
          var code_info = core.user.code()
          core.services.clearSessionInfo({}) // WILL FORCE THE CORE SETTING TO RELOAD
          switch (code_info.type) {
            case 'educator':
              // LOAD THE EDUCATOR LOGIN PANEL
              THIS.set('school_acct_id', code_info.id)
              THIS.set('code', code_info.code)
              THIS.set('school_name', code_info.name)
              THIS.toggle.panelByName({
                panel_name: 'verify_educator_login'
              })
              break
          }
        } else {
          if (core.user.loggedIn()) {
            if (core.user.change_password() === true) {
              THIS.toggle.panelByName({
                panel_name: 'change_password'
              })
            } else if (core.user.userType() === 'student' && core.user.isRogue() === 'yes') {
              if (core.services.getURLParam('refer') !== 'core') {
                window.location = core.fetch.path('register-student', {
                  refer: 'core'
                })
              }
            } else {
              switch (THIS.get('user_type')) {
                case 'generic':
                case 'unknown':
                  if (THIS.get('subscription') == 'premium') {
                    // PREMIUM UNKNOWN SUBSCRIPTION
                    switch (THIS.get('context')) {
                      case 'mixer':
                      case 'my-brainpop':
                      case 'content':
                        if (core.user.mybpEnabled()) {
                          // THIS.toggle.panelByName({panel_name : 'premium_unknown_subscription'});
                        }
                        break
                      case 'quiz':
                        // THIS.toggle.panelByName({panel_name : 'student_quiz_login_offer'});
                        break
                      case 'gamesup':
                        THIS.toggle.panelByName({
                          panel_name: 'student_game_login_offer'
                        })
                        break
                      case 'educators':
                        break
                      case 'free':
                        break
                      default:
                        break
                    }
                  } else if (THIS.get('subscription') == 'expired') {
                    core.accounts.logout({
                      async: true,
                      onSuccess: function (json) {
                        THIS.toggle.panelByName({
                          panel_name: 'generic_expired'
                        })
                      },
                      onFailure: function (json) {}
                    })
                  }
                  break
                case 'teacher':
                  if (THIS.get('subscription') == 'premium') {
                    if (core.user.missing_cred() == 'true') {
                      THIS.toggle.panelByName({
                        panel_name: 'teacher_missing_info'
                      })
                    }
                  } else if (THIS.get('subscription') == 'basic') {
                    // LOG THE USER OUT AND POST A MESSAGE
                    core.accounts.logout({
                      async: true,
                      onSuccess: function (json) {
                        switch (THIS.get('context')) {
                          case 'content':
                          case 'free':
                          case 'educators':
                            THIS.toggle.panelByName({
                              panel_name: 'teacher_linked_basic'
                            })
                            break
                          case 'mixer':
                          case 'my-brainpop':
                            THIS.toggle.panelByName({
                              panel_name: 'teacher_basic_my_brainpop'
                            })
                            break
                          case 'gamesup':
                          case 'quiz':
                            break
                          default:
                            break
                        }
                      },
                      onFailure: function (json) {}
                    })
                  } else if (THIS.get('subscription') == 'none') {
                    core.accounts.logout({
                      async: true,
                      onSuccess: function (json) {
                        if (core.user.wasLinkedBefore()) {
                          THIS.toggle.panelByName({
                            panel_name: 'teacher_unlinked_with_history'
                          })
                        } else {
                          THIS.toggle.panelByName({
                            panel_name: 'teacher_unlinked'
                          })
                        }
                      },
                      onFailure: function (json) {}
                    })
                  } else if (THIS.get('subscription') == 'expired') {
                    core.accounts.logout({
                      async: true,
                      onSuccess: function (json) {
                        THIS.toggle.panelByName({
                          panel_name: 'teacher_expired'
                        })
                      },
                      onFailure: function (json) {}
                    })
                  }
                  break
                case 'student':
                  if (THIS.get('subscription') == 'none') {
                    // ORPHAN STUDENT.
                    if (core.user.ssoLoggedIn()) {
                      // IF IT'S AN SSO PROVISIONED ACCOUNT, OPEN THE ORPHAN STUDENT PANEL NO MATTER WHAT CONTEXT WE'RE ON. IF NOT, ONLY OPEN FOR QUIZ AND CONTENT CONTEXT.
                      THIS.toggle.panelByName({
                        panel_name: 'orphan_student'
                      })
                    } else {
                      switch (THIS.get('context')) {
                        case 'content':
                        case 'quiz':
                          THIS.toggle.panelByName({
                            panel_name: 'orphan_student'
                          })
                          break
                        case 'mixer':
                        case 'my-brainpop':
                        case 'gamesup':
                        case 'educators':
                        case 'free':
                          break
                        default:
                          break
                      }
                    }
                  } else if (THIS.get('subscription') == 'expired') {
                    switch (THIS.get('context')) {
                      case 'content':
                      case 'quiz':
                        THIS.toggle.panelByName({
                          panel_name: 'orphan_student'
                        })
                        break
                      case 'mixer':
                      case 'my-brainpop':
                      case 'gamesup':
                      case 'educators':
                      case 'free':
                        break
                      default:
                        break
                    }
                  }
                  break
              }
            }
          } else {
            // NOT LOGGED IN USER MESSAGING
            switch (THIS.get('context')) {
              case 'mixer':
                break
              case 'quiz':
              case 'content':
                // #13: NOT LOGGED IN ON A CONTEXT PAGE
                THIS.toggle.panelByName({
                  panel_name: 'login'
                })
                break
              case 'gamesup':
                break
            }
          }

          // IF YOU GOT
        }
      }

      // USER MENU MANGMENT
      if (core.user.loggedIn() && (core.user.hasProductAccess() || (core.user.userType() === 'student' && core.user.isOrphan() === 'yes') || (core.user.userType() === 'student' && core.user.isRogue() === 'yes') || THIS.get('subscription') == 'expired' || (core.user.userType() === 'teacher' && THIS.get('subscription') == 'none'))) {
        $j('#logout_container').hide()
        $j('.usermenu_spacer').show()
        core.userNavigationMenu.get({
          container: $j('#user_menu_element'),
          user_type: THIS.get('user_type'),
          context: THIS.get('context'),
          subscription: THIS.get('subscription'),
          parent_subscription: THIS.get('parent_subscription'),
          subscription_managment: core.user.subscription_managment(),
          loggedIn: core.user.loggedIn(),
          verified: THIS.get('verified'),
          username: core.user.displayName(),
          permissions: core.user.permissions(),
          product: THIS.get('product')
        })
      } else {
        $j('.usermenu_spacer, .usermenu_container').hide()
        $j('#logout_container').show()
      }
    },
    panel: function (params) {
      if (THIS.get('panel_open_with') == params.name) {
        // PANEL OPEN, CLOSE IT
        $j('#utility-bar-info-panel').slideUp('slow', function () {})
        $j('#' + THIS.get('panel_open_with')).hide()
        THIS.set('panel_open', false)
        THIS.set('panel_open_with', '')
        if (THIS.get('open_panel_on_close') !== undefined && THIS.get('open_panel_on_close') !== '') {
          THIS.get('open_panel_on_close')()
          THIS.set('open_panel_on_close', '')
        }
        // AFTER THE PANEL WAS CLOSED, CHECK IF IT IS A SESSION PANEL
        if ($j('#close_' + params.name).hasClass('close_for_session')) {
          var tmp_obj = {}
          tmp_obj['dont_open_panel_' + params.name] = true
          core.persistentData.set(tmp_obj, true)
        }
      } else {
        // PANEL CLOSED. OPEN IT
        if (THIS.get('panel_open') === false) {
          // PANEL IS CLOSED AND WE NEED TO OPEN FOR THE FIRST TIME. USE SLIDE DOWN
          var open_panel = true
          if ($j('#close_' + params.name).hasClass('close_for_session')) {
            if (core.persistentData.get('dont_open_panel_' + params.name, true) === 'true') {
              open_panel = false
            }
          }

          if (open_panel) {
            $j('#' + params.name).show()
            $j('#utility-bar-info-panel').slideDown('slow', function () {
              if (params.onOpen !== undefined && params.onOpen !== '') {
                params.onOpen()
              }
              if (params.onClose !== undefined && params.onClose !== '') {
                THIS.set('open_panel_on_close', params.onClose)
              }
            })
            THIS.set('panel_open', true)
          }
        } else {
          // PANEL IS OPEN AND WE NEED TO OPEN A NEW DIALOG. USE FADING EFFECT
          $j('#' + THIS.get('panel_open_with')).fadeOut('3000', function () {
            // AFTER THE PANEL WAS CLOSED, CHECK IF IT IS A SESSION PANEL
            if ($j('#close_' + THIS.get('panel_open_with')).hasClass('close_for_session')) {
              var tmp_obj = {}
              tmp_obj['dont_open_panel_' + THIS.get('panel_open_with')] = true
              core.persistentData.set(tmp_obj, true)
            }
            if (THIS.get('open_panel_on_close') !== undefined && THIS.get('open_panel_on_close') !== '') {
              THIS.get('open_panel_on_close')()
              THIS.set('open_panel_on_close', '')
            }
            if (!core.persistentData.get('dont_open_panel_' + params.name, true)) {
              $j('#' + params.name).fadeIn('3000')
              if (params.onOpen !== undefined && params.onOpen !== '') {
                params.onOpen()
              }
              if (params.onClose !== undefined && params.onClose !== '') {
                THIS.set('open_panel_on_close', params.onClose)
              }
            }
          })
        }
        THIS.set('panel_open_with', params.name)
      }
    },
    panelByName: function (params) {
      if (params.panel_name !== '') {
        THIS.toggle.panel(eval('THIS.panels.' + params.panel_name)())
      }
    }
  }
  this.panels = {
    change_password: function () {
      return {
        name: 'change_password',
        onOpen: function () {
          $j('#change_password_p1, #change_password_p2').val('')
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#change_password_p1'),
                text: core.translations.get('password_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#change_password_p2'),
                text: core.translations.get('password_retype_hint', THIS.get('tcontext'))
              }
            ]
          })
          //core.restrict.password( $j('#change_password_p1') );
          //core.restrict.password( $j('#change_password_p2') );
          $j('#change_password_p1').focus()
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_change_password').off()
          $j('#close_change_password')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'change_password'
              })
              event.preventDefault()
            })

          // ON LOGIN INPUTS ENTER CLICK
          $j('#change_password_p2, #change_password_p1').off()
          $j('#change_password_p2, #change_password_p1').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#update_password').trigger('click')
            }
          })

          $j('#update_password').off()
          $j('#update_password')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#update_password').hasClass('disabled')) {
                if ($j('#change_password_p1').val() === '') {
                  $j('.change_password_errors').hide()
                  $j('#change_password_p1').focus()
                  $j('#change_password_p1_missing_placeholder').fadeIn()
                } else if ($j('#change_password_p2').val() === '') {
                  $j('.change_password_errors').hide()
                  $j('#change_password_p2_missing_placeholder').fadeIn()
                  $j('#change_password_p2').focus()
                } else if ($j('#change_password_p1').val() != $j('#change_password_p2').val()) {
                  $j('.change_password_errors').hide()
                  $j('#change_password_password_mismatch_placeholder').fadeIn()
                  $j('#change_password_p2').focus()
                } else {
                  $j('.change_password_errors').hide()
                  $j('#update_password').addClass('disabled')
                  core.accounts.changePassword({
                    async: true,
                    password: $j('#change_password_p1').val(),
                    id: core.user.id(),
                    user_type: core.user.userType(),
                    language: THIS.get('language'),
                    onSuccess: THIS.callbacks.passwordChanged,
                    onFailure: THIS.callbacks.passwordChangeFailed
                  })
                }
              }
              event.preventDefault()
            })
        }
      }
    },
    changed_password: function () {
      return {
        name: 'changed_password',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_changed_password').off()
          $j('#close_changed_password')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'changed_password'
              })
              event.preventDefault()
            })

          $j('#password_changed_login_link').off()
          $j('#password_changed_login_link')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
        }
      }
    },
    edu_account_linked: function () {
      return {
        name: 'edu_account_linked',
        onOpen: function () {
          var school_name = core.services.empty(core.persistentData.get('school_name', true)) ? THIS.get('school_name') : core.persistentData.get('school_name', true)
          $j('#edu_acct_linked_school_name').html(school_name)
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_edu_account_linked').off()
          $j('#close_edu_account_linked')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'edu_account_linked'
              })
              event.preventDefault()
            })
        }
      }
    },
    educators_account_state: function () {
      return {
        name: 'educators_account_state',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#verify_educator_username'),
                text: core.translations.get('educator_username_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#verify_educator_password'),
                text: core.translations.get('educator_password_hint', THIS.get('tcontext'))
              }
            ]
          })
          core.restrict.username($j('#verify_educator_username'))
          //core.restrict.password( $j('#verify_educator_password') );
          $j('#verify_educator_username, #verify_educator_password').val('')
          $j('#educator_verify_account').removeClass('disabled')
          $j('.frm_educator_login_errors').hide()
          $j('#verify_educator_username').focus()
        },
        onClose: function () {},
        events: function () {
          $j('#close_educators_account_state').off()
          $j('#close_educators_account_state')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'educators_account_state'
              })
              event.preventDefault()
            })

          $j('#educator_create_account').off()
          $j('#educator_create_account')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              /*$j('#frm_dummy').append('<input type="hidden" name="code" value="'+THIS.get('code')+'">');
                        $j('#frm_dummy').append('<input type="hidden" name="school_id" value="'+THIS.get('school_acct_id')+'">');
                        $j('#frm_dummy').append('<input type="hidden" name="school_name" value="'+THIS.get('school_name')+'">');
                        $j('#frm_dummy').append('<input type="hidden" name="refer" value="'+core.fetch.path('register-educator', {})+'">');
                        $j('#frm_dummy').append('<input type="hidden" name="origin" value="'+window.location.origin+'">');
                        $j('#frm_dummy').attr('action', '/core/services/create_educators_account_prep.php').submit();*/
              THIS.services.gotoEducatorRegistration({
                code: THIS.get('code'),
                school_id: THIS.get('school_acct_id'),
                school_name: THIS.get('school_name')
              })
              event.preventDefault()
            })

          $j('#educator_verify_account').off()
          $j('#educator_verify_account')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#educator_verify_account').hasClass('disabled')) {
                $j('#educator_verify_account').addClass('disabled')
                $j('.frm_verify_educator_login_errors').hide()
                if ($j('#verify_educator_username').val() === '') {
                  $j('#verify_educator_username_error_placeholder').fadeIn()
                  $j('#verify_educator_username').focus()
                  $j('#educator_verify_account').removeClass('disabled')
                } else if ($j('#verify_educator_password').val() === '') {
                  $j('#verify_educator_password_error_placeholder').fadeIn()
                  $j('#verify_educator_password').focus()
                  $j('#educator_verify_account').removeClass('disabled')
                } else {
                  core.accounts.confirmAccountLogin({
                    async: true,
                    username: $j('#verify_educator_username').val(),
                    language: THIS.get('language'),
                    code: '',
                    password: $j('#verify_educator_password').val(),
                    context: THIS.get('context'),
                    onSuccess: THIS.callbacks.educatorLoginVerified,
                    onFailure: THIS.callbacks.educatorLoginConVerificationFailed
                  })
                }
              }
              event.preventDefault()
            })

          $j('#verify_educator_username, #verify_educator_password').off()
          $j('#verify_educator_username, #verify_educator_password').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#educator_verify_account').trigger('click')
            }
          })
        }
      }
    },
    educators_already_linked_to_parent: function () {
      return {
        name: 'educators_already_linked_to_parent',
        onOpen: function () {
          core.services.clearSessionInfo({})
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_educators_already_linked_to_parent').off()
          $j('#close_educators_already_linked_to_parent')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'educators_already_linked_to_parent'
              })
              event.preventDefault()
            })

          $j('#educators_already_linked_to_parent_login_link').off()
          $j('#educators_already_linked_to_parent_login_link')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
        }
      }
    },
    enter_code: function () {
      return {
        name: 'enter_code',
        onOpen: function () {
          $j('#student_additional_message, #student_additional_links, #generic_additional_links').hide()
          if (THIS.get('i_am_a') === 'student') {
            $j('#student_additional_message, #student_additional_links').show()
          } else {
            $j('#generic_additional_links').show()
          }

          this.events()
          $j('.utility_bar_small_buttons').removeClass('small_button_' + THIS.get('colorscheme') + '_selected')
          $j('.enter_code_button').addClass('small_button_' + THIS.get('colorscheme') + '_selected')
          $j('#code').focus()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#code'),
                text: core.translations.get('code_hint', THIS.get('tcontext'))
              }
            ]
          })
          core.restrict.class_code($j('#code'))
          THIS.set('code', '')
        },
        onClose: function () {
          $j('.utility_bar_small_buttons').removeClass('small_button_' + THIS.get('colorscheme') + '_selected')
          $j('#enter_code').hide()
          $j('.code_errors').hide()
          $j('#code').val('')
          // CLEAR SESSION
          THIS.set('i_am_a', '')
          $j('#student_additional_message, #student_additional_links, #generic_additional_links').hide()
        },
        events: function () {
          // ON HAVE AN EDUCATORS LINK
          $j('.have_an_educator_code').off()
          $j('.have_an_educator_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              event.preventDefault()
              if (core.user.loggedIn() && core.user.userType() == 'educator') {
                window.location.href = core.fetch.path('link-bp-account', {
                  aid: core.user.id()
                })
              } else {
                THIS.toggle.panelByName({
                  panel_name: 'login',
                  mode: 'educators',
                  link_after_login: 'yes'
                })
              }
            })

          // ON CANCEL CODE BUTTON CLICK
          $j('#cancel_code').off()
          $j('#cancel_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_code'
              })
              event.preventDefault()
            })

          // ON VALIDATE CODE BUTTON CLICK
          $j('#validate_code').off()
          $j('#validate_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('action', 'code_verification')
              $j('.code_errors').hide()
              if (!$j('#validate_code').hasClass('disabled')) {
                $j('#validate_code').addClass('disabled')
                if ($j('#code').val() === '') {
                  $j('#validate_code').removeClass('disabled')
                  $j('#code_missing_error_placeholder').fadeIn()
                  $j('#code').focus()
                } else {
                  // VALIDATE CODE
                  $j.ajax({
                    type: 'POST',
                    async: true,
                    url: '/services/validate_code.php',
                    dataType: 'json',
                    data: {
                      code: $j('#code').val(),
                      user_id: core.user.id(),
                      language: THIS.get('language'),
                      product: 'bp'
                    },
                    cache: false,
                    success: THIS.callbacks.codeValidated,
                    error: function (jqXHR, textStatus, errorThrown) {}
                  })
                }
              }
              event.preventDefault()
            })

          // ON CODE INPUT ENTER CLICK
          $j('#code').off()
          $j('#code').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#validate_code').trigger('click')
            }
          })

          $j('#close_enter_code').off()
          $j('#close_enter_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_code'
              })
              event.preventDefault()
            })

          if (THIS.get('i_am_a') === 'student') {
            $j('#sso_i_dont_have_a_code_link').off()
            $j('#sso_i_dont_have_a_code_link')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                window.location.href = core.fetch.path('sso_login', {
                  parent: 'true'
                })
                event.preventDefault()
              })
          } else {
            $j('#whats_a_code_generic_help').off()
            $j('#whats_a_code_generic_help')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                core.persistentData.set(
                  {
                    caller: 'enter_code'
                  },
                  true
                )
                THIS.toggle.panelByName({
                  panel_name: 'whats_a_code'
                })
                event.preventDefault()
              })

            $j('#enter_code_later').off()
            $j('#enter_code_later')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                window.location.href = core.fetch.path('sso_login', {
                  parent: 'true'
                })
                event.preventDefault()
              })
          }
        }
      }
    },
    enter_educators_code: function () {
      return {
        name: 'enter_educators_code',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#educators_code'),
                text: core.translations.get('educators_code', THIS.get('tcontext'))
              }
            ]
          })
          $j('#educators_code').focus()
          $j('.enter_educators_code_messages').hide()
          if (core.user.loggedIn() === true && core.user.userType() == 'teacher') {
            $j('#not_logged_in_section').show()
          } else {
            $j('#logged_in_section').show()
          }
        },
        events: function () {
          $j('#help_educator_get_code').off()
          $j('#help_educator_get_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('action', 'code_help')
              THIS.services.processSchool()
              event.preventDefault()
            })

          $j('#educators_code').off()
          $j('#educators_code').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#verify_educators_code').trigger('click')
            }
          })

          $j('#verify_educators_code').off()
          $j('#verify_educators_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('action', 'code_verification')
              if (!$j('#verify_educators_code').hasClass('disabled')) {
                $j('#verify_educators_code').addClass('disabled')
                $j('.frm_educator_code_errors').hide()
                if ($j('#educators_code').val() === '') {
                  $j('#educator_code_missing_error_placeholder').fadeIn()
                  $j('#educators_code').focus()
                  $j('#verify_educators_code').removeClass('disabled')
                } else {
                  $j.ajax({
                    type: 'POST',
                    async: true,
                    url: '/core/services/validate_code.php',
                    dataType: 'json',
                    data: {
                      code: $j('#educators_code').val(),
                      language: THIS.get('language')
                    },
                    cache: false,
                    success: THIS.callbacks.educatorCodeValidated,
                    error: function (jqXHR, textStatus, errorThrown) {}
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_enter_educators_code').off()
          $j('#close_enter_educators_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_educators_code'
              })
              event.preventDefault()
            })

          $j('#enter_educator_code_login').off()
          $j('#enter_educator_code_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
        }
      }
    },
    enter_student_code: function () {
      return {
        name: 'enter_student_code',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#student_code'),
                text: core.translations.get('student_code', THIS.get('tcontext'))
              }
            ]
          })
          $j('#student_code').focus()
        },
        events: function () {
          $j('#student_code').off()
          $j('#student_code').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#verify_student_code').trigger('click')
            }
          })

          $j('#verify_student_code').off()
          $j('#verify_student_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('action', 'code_verification')
              if (!$j('#verify_student_code').hasClass('disabled')) {
                $j('#verify_student_code').addClass('disabled')
                $j('.frm_student_code_errors').hide()
                if ($j('#student_code').val() === '') {
                  $j('#student_code_missing_error_placeholder').fadeIn()
                  $j('#student_code').focus()
                  $j('#verify_student_code').removeClass('disabled')
                } else {
                  $j.ajax({
                    type: 'POST',
                    async: true,
                    url: '/core/services/validate_code.php',
                    dataType: 'json',
                    data: {
                      code: $j('#student_code').val(),
                      language: THIS.get('language')
                    },
                    cache: false,
                    success: THIS.callbacks.studentCodeValidated,
                    error: function (jqXHR, textStatus, errorThrown) {}
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_enter_student_code, #cancel_verify_student_code').off()
          $j('#close_enter_student_code, #cancel_verify_student_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_student_code'
              })
              event.preventDefault()
            })

          $j('#enter_student_code_login').off()
          $j('#enter_student_code_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'verify_student_login'
              })
              event.preventDefault()
            })

          $j('.whats_a_code_link').off()
          $j('.whats_a_code_link')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              core.persistentData.set(
                {
                  caller: 'enter_student_code'
                },
                true
              )
              THIS.toggle.panelByName({
                panel_name: 'whats_a_code'
              })
              event.preventDefault()
            })

          $j('.whats_a_code_teacher_code_help').off()
          $j('.whats_a_code_teacher_code_help')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_code_help'
              })
              event.preventDefault()
            })

          $j('.whats_a_code_student_help').off()
          $j('.whats_a_code_student_help')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'student_code_help'
              })
              event.preventDefault()
            })
        }
      }
    },
    error_in_process: function () {
      return {
        name: 'error_in_process',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_error_in_process').off()
          $j('#close_error_in_process')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.error({})
              event.preventDefault()
            })
        }
      }
    },
    flash_disabled: function () {
      return {
        name: 'flash_disabled',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_flash_disabled').off()
          $j('#close_flash_disabled')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'flash_disabled'
              })
              event.preventDefault()
            })
        }
      }
    },
    generic_expired: function () {
      return {
        name: 'generic_expired',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_generic_expired').off()
          $j('#close_generic_expired')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'generic_expired'
              })
              event.preventDefault()
            })

          $j('#generic_expired_renew_now').off()
          $j('#generic_expired_renew_now')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('renew', {})
              event.preventDefault()
            })

          $j('#generic_expired_ask_us').off()
          $j('#generic_expired_ask_us')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('askus', {})
              event.preventDefault()
            })
        }
      }
    },
    help_educator_get_code_step2: function () {
      return {
        name: 'help_educator_get_code_step2',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#code_request_first_name'),
                text: core.translations.get('request_code_first_name_watermark', THIS.get('tcontext'))
              },
              {
                obj: $j('#code_request_last_name'),
                text: core.translations.get('request_code_last_name_watermark', THIS.get('tcontext'))
              },
              {
                obj: $j('#code_request_email'),
                text: core.translations.get('request_code_email_watermark', THIS.get('tcontext'))
              }
            ]
          })
          core.restrict.email($j('#code_request_email'))

          $j('#school_name').html(THIS.get('school_name'))
          $j('#admin_name').html(THIS.get('school_contact_name'))

          $j('#code_request_first_name').focus()
        },
        events: function () {
          $j('#code_request_send').off()
          $j('#code_request_send')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#code_request_send').hasClass('disabled')) {
                $j('#code_request_send').addClass('disabled')
                $j('.code_request_errors').hide()
                if ($j('#code_request_first_name').val() === '') {
                  $j('#code_request_first_name_error_placeholder').fadeIn()
                  $j('#code_request_first_name').focus()
                  $j('#code_request_send').removeClass('disabled')
                } else if ($j('#code_request_last_name').val() === '') {
                  $j('#code_request_last_name_error_placeholder').fadeIn()
                  $j('#code_request_last_name').focus()
                  $j('#code_request_send').removeClass('disabled')
                } else if ($j('#code_request_email').val() === '') {
                  $j('#code_request_email_error_placeholder').fadeIn()
                  $j('#code_request_email').focus()
                  $j('#code_request_send').removeClass('disabled')
                } else if (core.services.validateEmail($j('#code_request_email').val()) !== true) {
                  $j('#code_request_invalid_email_error_placeholder').fadeIn()
                  $j('#code_request_email').focus()
                  $j('#code_request_send').removeClass('disabled')
                } else {
                  $j.ajax({
                    type: 'POST',
                    async: true,
                    url: '/core/services/send_code_request.php',
                    dataType: 'json',
                    data: {
                      first_name: $('#code_request_first_name').val(),
                      last_name: $('#code_request_last_name').val(),
                      email: $('#code_request_email').val(),
                      school_name: $('#school_name').html(),
                      school_acct_id: THIS.get('school_acct_id'),
                      language: THIS.get('language')
                    },
                    cache: false,
                    success: THIS.callbacks.codeRequestSent,
                    error: function (jqXHR, textStatus, errorThrown) {}
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_help_educator_get_code_step2').off()
          $j('#close_help_educator_get_code_step2')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'help_educator_get_code_step2'
              })
              event.preventDefault()
            })

          $j('#code_request_first_name, #code_request_last_name, #code_request_email').off()
          $j('#code_request_first_name, #code_request_last_name, #code_request_email').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#code_request_send').trigger('click')
            }
          })
        }
      }
    },
    help_educator_get_code_step3: function () {
      return {
        name: 'help_educator_get_code_step3',
        onOpen: function () {
          this.events()
          $j('#admin_name_code_request_sent').html(THIS.get('school_contact_name'))
        },
        events: function () {
          $j('#close_help_educator_get_code_step3').off()
          $j('#close_help_educator_get_code_step3')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'help_educator_get_code_step3'
              })
              event.preventDefault()
            })
        }
      }
    },
    ie8_message: function () {
      return {
        name: 'ie8_message',
        onOpen: function () {
          this.events()
        },
        onClose: function () {
          //THIS.toggle.initial_panel_state({});
        },
        events: function () {
          $j('#close_ie8_message').off()
          $j('#close_ie8_message')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'ie8_message'
              })
              event.preventDefault()
            })
        }
      }
    },
    learn_more: function () {
      return {
        name: 'learn_more',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('learn_more_login').off()
          $j('#learn_more_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })

          $j('i_am_a_student').off()
          $j('#i_am_a_student')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_student_code'
              })
              event.preventDefault()
            })

          $j('i_am_a_teacher').off()
          $j('#i_am_a_teacher')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_educators_code'
              })
              event.preventDefault()
            })

          $j('#close_learn_more').off()
          $j('#close_learn_more')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'learn_more'
              })
              event.preventDefault()
            })
        }
      }
    },
    login: function () {
      return {
        name: 'login',
        onOpen: function () {
          this.events()
          $j('.utility_bar_small_buttons').removeClass('small_button_' + THIS.get('colorscheme') + '_selected')
          $j('#login_button').addClass('small_button_' + THIS.get('colorscheme') + '_selected')
          $j('#username').focus()

          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#username'),
                text: core.translations.get('username_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#password'),
                text: core.translations.get('password_hint', THIS.get('tcontext'))
              }
            ]
          })
          core.restrict.username($j('#username'))
          //core.restrict.password( $j('#password') );
        },
        onClose: function () {
          $j('.utility_bar_small_buttons').removeClass('small_button_' + THIS.get('colorscheme') + '_selected')
          $j('.frm_login_errors').hide()
          $j('#username, #password').val('')
        },
        events: function () {
          // ON LOGIN BUTTON CLICK
          /*$j('#login_button').off();
                    $j('#login_button').on('click', function (event) {
                        if(!$j('#login_button').hasClass('small_button_'+THIS.get('colorscheme')+'_selected')){
                            THIS.toggle.panelByName({panel_name : 'login'});
                        }
                        event.preventDefault();
                    });*/

          // ON CANCEL LOGIN BUTTON CLICK
          $j('#cancel_login').off()
          $j('#cancel_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })

          // ON LOGIN INPUTS ENTER CLICK
          $j('#username, #password').off()
          $j('#username, #password').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#perform_login').trigger('click')
            }
          })

          // ON LOGIN EXECURE BUTTON CLICK
          $j('#perform_login').off()
          $j('#perform_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#perform_login').hasClass('disabled')) {
                $j('#perform_login').addClass('disabled')
                $j('.frm_login_errors').hide()
                if ($j('#username').val() === '') {
                  $j('#username_error_placeholder').fadeIn()
                  $j('#username').focus()
                  $j('#perform_login').removeClass('disabled')
                } else if ($j('#password').val() === '') {
                  $j('#password_error_placeholder').fadeIn()
                  $j('#password').focus()
                  $j('#perform_login').removeClass('disabled')
                } else {
                  core.accounts.confirmAccountLogin({
                    async: true,
                    username: $j('#username').val(),
                    language: THIS.get('language'),
                    code: '',
                    product: THIS.get('product'),
                    password: $j('#password').val(),
                    context: THIS.get('context'),
                    onSuccess: THIS.callbacks.accountLoginConfirmed,
                    onFailure: THIS.callbacks.accountLoginConfirmationFailed
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_login').off()
          $j('#close_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })

          $j('#need_help_loging_in').off()
          $j('#need_help_loging_in')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('password-reminder', {})
              event.preventDefault()
            })

          $j('#need_help_loging_in_admin').off()
          $j('#need_help_loging_in_admin')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.open(core.fetch.path('password-reminder', {}))
              event.preventDefault()
            })
        }
      }
    },
    my_brainpop: function () {
      return {
        name: 'my_brainpop',
        onOpen: function () {
          $j('#myp_button').addClass('small_button_' + THIS.get('colorscheme') + '_selected')
          this.events()
        },
        onClose: function () {
          $j('#myp_button').removeClass('small_button_' + THIS.get('colorscheme') + '_selected')
        },
        events: function () {
          $j('#close_my_brainpop').off()
          $j('#close_my_brainpop')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'my_brainpop'
              })
              event.preventDefault()
            })

          /*$j('.mbp_item_div').off();
                    $j('.mbp_item_div').on('click', THIS.callbacks.disableDBLClick).on('click', function (event) {
                        window.location.href = core.fetch.path($j(this).attr('id'), {});
                        event.preventDefault();
                    });*/
        }
      }
    },
    mbp_offer: function () {
      return {
        name: 'mbp_offer',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_mbp_offer').off()
          $j('#close_mbp_offer')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'mbp_offer'
              })
              event.preventDefault()
            })

          $j('#myp_offer_use_school_account').off()
          $j('#myp_offer_use_school_account')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              // LOG IN WITH PARENT ACCOUNT. ALL REQUIRED PARAMS ARE SET IN THE PHP SESSION
              window.location.href = core.fetch.path('sso_login', {
                parent: 'true'
              })
              event.preventDefault()
            })

          $j('#myp_offer_login').off()
          $j('#myp_offer_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              var sso_params = core.user.sso()
              if (sso_params.already_linked === 'true') {
                // OLD PARENT LINK FOUND. SHOW WARNING MESSAGE. AFTER WARNING MESSAGE HAS BEEN APPROVED, THE ACCOUNT SHOULD AUTO LOGIN, WHICH WILL RELINK TO NEW ACCOUNT
                THIS.set('sso_action', 'autologin')
                THIS.toggle.panelByName({
                  panel_name: 'educators_relink_confirmation'
                })
              } else {
                THIS.set('force_login_type', 'student_or_educator')
                THIS.toggle.panelByName({
                  panel_name: 'login'
                })
              }
              event.preventDefault()
            })

          $j('#myp_offer_register').off()
          $j('#myp_offer_register')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'register_as'
              })
              event.preventDefault()
            })
        }
      }
    },
    orphan_student: function () {
      return {
        name: 'orphan_student',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#orphan_student_code'),
                text: core.translations.get('student_code', THIS.get('tcontext'))
              }
            ]
          })
          $j('#orphan_student_code').focus()

          $j('.student_messages').hide()
          if (core.user.subscription_level() == 'expired') {
            // SHOW EXPIRED MESSAGE
            $j('.expired_student_message').show()
          } else {
            // SHOW ORPHAN MESSAGE
            $j('.orphan_student_message').show()
          }
        },
        events: function () {
          $j('#orphan_student_code').off()
          $j('#orphan_student_code').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#verify_orphan_student_code').trigger('click')
            }
          })

          $j('#verify_orphan_student_code').off()
          $j('#verify_orphan_student_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('action', 'code_verification')
              if (!$j('#verify_orphan_student_code').hasClass('disabled')) {
                $j('#verify_orphan_student_code').addClass('disabled')
                $j('.frm_orphan_student_code_errors').hide()
                if ($j('#orphan_student_code').val() === '') {
                  $j('#orphan_student_code_missing_error_placeholder').fadeIn()
                  $j('#orphan_student_code').focus()
                  $j('#verify_orphan_student_code').removeClass('disabled')
                } else {
                  $j.ajax({
                    type: 'POST',
                    async: true,
                    url: '/core/services/validate_code.php',
                    dataType: 'json',
                    data: {
                      code: $j('#orphan_student_code').val(),
                      language: THIS.get('language')
                    },
                    cache: false,
                    success: THIS.callbacks.orphanStudentCodeValidated,
                    error: function (jqXHR, textStatus, errorThrown) {}
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_enter_orphan_student_code').off()
          $j('#close_enter_orphan_student_code')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'orphan_student'
              })
              event.preventDefault()
            })
        }
      }
    },
    orphan_student_joined: function () {
      return {
        name: 'orphan_student_joined',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#orphan_student_username'),
                text: core.translations.get('student_username_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#orphan_student_password'),
                text: core.translations.get('student_password_hint', THIS.get('tcontext'))
              }
            ]
          })
          core.restrict.username($j('#orphan_student_username'))
          //core.restrict.password( $j('#orphan_student_password') );
          $j('#orphan_student_joined_class_name').html(THIS.get('class_name'))
          $j('#orphan_student_username').focus()
        },
        events: function () {
          $j('#orphan_student_login_submit').off()
          $j('#orphan_student_login_submit')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#orphan_student_login_submit').hasClass('disabled')) {
                $j('#orphan_student_login_submit').addClass('disabled')
                $j('.frm_orphan_student_login_errors').hide()
                if ($j('#orphan_student_username').val() === '') {
                  $j('#orphan_student_username_error_placeholder').fadeIn()
                  $j('#orphan_student_username').focus()
                  $j('#orphan_student_login_submit').removeClass('disabled')
                } else if ($j('#orphan_student_password').val() === '') {
                  $j('#orphan_student_password_error_placeholder').fadeIn()
                  $j('#orphan_student_password').focus()
                  $j('#orphan_student_login_submit').removeClass('disabled')
                } else {
                  core.accounts.confirmAccountLogin({
                    async: true,
                    username: $j('#orphan_student_username').val(),
                    language: THIS.get('language'),
                    code: '',
                    password: $j('#orphan_student_password').val(),
                    context: THIS.get('context'),
                    onSuccess: THIS.callbacks.orphanStudentLoginConfirmed,
                    onFailure: THIS.callbacks.orphanStudentLoginConfirmationFailed
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_orphan_student_joined').off()
          $j('#close_orphan_student_joined')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'orphan_student_joined'
              })
              event.preventDefault()
            })

          $j('#orphan_student_username, #orphan_student_password').off()
          $j('#orphan_student_username, #orphan_student_password').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#orphan_student_login_submit').trigger('click')
            }
          })

          $j('.forgot_password').off()
          $j('.forgot_password')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.open(core.fetch.path('password-reminder', {}))
              event.preventDefault()
            })
        }
      }
    },
    premium_unknown_subscription: function () {
      return {
        name: 'premium_unknown_subscription',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('premium_unknown_login').off()
          $j('#premium_unknown_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
          $j('premium_unknown_learn_more').off()
          $j('#premium_unknown_learn_more')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'learn_more'
              })
              event.preventDefault()
            })

          $j('#close_premium_unknown_subscription').off()
          $j('#close_premium_unknown_subscription')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'premium_unknown_subscription'
              })
              event.preventDefault()
            })
        }
      }
    },
    register_as: function () {
      return {
        name: 'register_as',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_register_as').off()
          $j('#close_register_as')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'register_as'
              })
              event.preventDefault()
            })

          $j('#register_as_teacher').off()
          $j('#register_as_teacher')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#register_as_teacher').hasClass('disabled')) {
                $j('#register_as_teacher, #register_as_student').addClass('disabled')
                THIS.set('sso_action', 'register_educator')
                THIS.toggle.panelByName({
                  panel_name: 'enter_code'
                })
                /*var create_url = core.fetch.path('sso_create_educator', {});
                            if(core.user.missingSSOInfo('teacher')){
                                THIS.set('sso_missing_info', {'url' : create_url, 'type' : 'teacher'});
                                THIS.toggle.panelByName({
                                    'panel_name' : 'sso_missing_info'
                                });
                            }else{
                                window.location.href = create_url;
                            }*/
              }
              event.preventDefault()
            })

          $j('#register_as_student').off()
          $j('#register_as_student')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#register_as_student').hasClass('disabled')) {
                $j('#register_as_student, #register_as_teacher').addClass('disabled')
                THIS.set('sso_action', 'register_student')
                THIS.toggle.panelByName({
                  panel_name: 'enter_code'
                })
              }
              event.preventDefault()
            })
        }
      }
    },
    sso_who_are_you: function () {
      return {
        name: 'sso_who_are_you',
        onOpen: function () {
          this.events()
        },
        onOpenPrevented: function () {
          window.location.href = core.fetch.path('sso_login', {
            parent: 'true'
          })
        },
        onClose: function () {},
        events: function () {
          $j('#close_sso_who_are_you').off()
          $j('#close_sso_who_are_you')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'sso_who_are_you'
              })
              event.preventDefault()
            })

          // ANY CHANGES TO THIS EVENT SHOULD TRIGGER AN UPDATE ON THE initial_panel_state FUNCTION AS IT SHARES THE SAME FUNCTIONALITY.
          $j('#sso_identify_teacher').off()
          $j('#sso_identify_teacher')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#sso_identify_teacher').hasClass('disabled')) {
                $j('#sso_identify_teacher, #sso_identify_student').addClass('disabled')
                THIS.set('i_am_a', 'teacher')
                if (core.user.missingSSOInfo('teacher')) {
                  THIS.toggle.panelByName({
                    panel_name: 'sso_missing_info'
                  })
                } else {
                  THIS.toggle.panelByName({
                    panel_name: 'enter_code'
                  })
                }
              }
              event.preventDefault()
            })

          // ANY CHANGES TO THIS EVENT SHOULD TRIGGER AN UPDATE ON THE initial_panel_state FUNCTION AS IT SHARES THE SAME FUNCTIONALITY.
          $j('#sso_identify_student').off()
          $j('#sso_identify_student')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#sso_identify_student').hasClass('disabled')) {
                $j('#sso_identify_teacher, #sso_identify_student').addClass('disabled')
                THIS.set('i_am_a', 'student')
                if (core.user.missingSSOInfo('student')) {
                  THIS.toggle.panelByName({
                    panel_name: 'sso_missing_info'
                  })
                } else {
                  THIS.toggle.panelByName({
                    panel_name: 'sso_i_am_a_student'
                  })
                }
              }
              event.preventDefault()
            })

          $j('#sso_identify_not_now').off()
          $j('#sso_identify_not_now')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if ($('#sso_who_are_you_dont_show_again').is(':checked')) {
                core.persistentData.set(
                  {
                    sso_who_are_you_dont_show_again: 'true'
                  },
                  true
                )
              }
              window.location.href = core.fetch.path('sso_login', {
                parent: 'true'
              })
              event.preventDefault()
            })
        }
      }
    },
    sso_i_am_a_student: function () {
      return {
        name: 'sso_i_am_a_student',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_sso_i_am_a_student').off()
          $j('#close_sso_i_am_a_student')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'sso_i_am_a_student'
              })
              event.preventDefault()
            })

          $j('#sso_student_has_account').off()
          $j('#sso_student_has_account')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('i_am_a', 'student')
              THIS.toggle.panelByName({
                panel_name: 'verify_student_login'
              })
              event.preventDefault()
            })

          $j('#sso_student_no_account').off()
          $j('#sso_student_no_account')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('i_am_a', 'student')
              THIS.set('sso_action_override', 'auto_create_student')
              THIS.toggle.panelByName({
                panel_name: 'enter_code'
              })
              event.preventDefault()
            })
        }
      }
    },
    sso_restricted: function () {
      return {
        name: 'sso_restricted',
        onOpen: function () {
          this.events()
        },
        onOpenPrevented: function () {
          //window.location.href = core.fetch.path('sso_login', {parent : 'true'});
        },
        onClose: function () {},
        events: function () {
          $j('#close_sso_restricted').off()
          $j('#close_sso_restricted')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'sso_restricted'
              })
              event.preventDefault()
            })

          $j('#sso_restricted_ok').off()
          $j('#sso_restricted_ok')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if ($('#sso_restricted_dont_show_again').is(':checked')) {
                core.persistentData.set(
                  {
                    sso_restricted_dont_show_again: 'true'
                  },
                  true
                )
              }
              //window.location.href = core.fetch.path('sso_login', {parent : 'true'});
              THIS.toggle.panelByName({
                panel_name: 'sso_restricted'
              })
              event.preventDefault()
            })
        }
      }
    },
    sso_terms_of_use: function () {
      return {
        name: 'sso_terms_of_use',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_sso_terms_of_use').off()
          $j('#close_sso_terms_of_use')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'sso_terms_of_use'
              })
              event.preventDefault()
            })

          $j('#terms_of_use_not_approved').off()
          $j('#terms_of_use_not_approved')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'sso_terms_of_use'
              })
              event.preventDefault()
            })

          $j('#terms_of_use_approved').off()
          $j('#terms_of_use_approved')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if ($('#chk_sso_terms_of_use').is(':checked') && $('#chk_sso_usage').is(':checked')) {
                var sso_params = core.user.sso()
                if (sso_params.already_linked === 'true' && THIS.get('tmp').id != sso_params.current_parent) {
                  THIS.set('sso_action', 'auto_create_educator')
                  THIS.toggle.panelByName({
                    panel_name: 'educators_relink_confirmation'
                  })
                } else {
                  var create_url = core.fetch.path('sso_create_educator', {
                    parent_id: THIS.get('tmp').id
                  })
                  if (core.user.missingSSOInfo('teacher')) {
                    THIS.set('sso_missing_info', {
                      url: create_url,
                      type: 'teacher'
                    })
                    THIS.toggle.panelByName({
                      panel_name: 'sso_missing_info'
                    })
                  } else {
                    window.location.href = create_url
                  }
                }
              } else {
                $('#sso_terms_of_use_not_approved').fadeIn()
              }
              event.preventDefault()
            })
        }
      }
    },
    student_account_state: function () {
      return {
        name: 'student_account_state',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_student_account_state').off()
          $j('#close_student_account_state')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'student_account_state'
              })
              event.preventDefault()
            })

          $j('#student_log_in').off()
          $j('#student_log_in')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'verify_student_login'
              })
              event.preventDefault()
            })

          $j('#student_create_account').off()
          $j('#student_create_account')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              /*$('#frm_dummy').append('<input type='hidden' name='code' value=''+THIS.get('code')+''>');
                        $('#frm_dummy').append('<input type='hidden' name='class_id' value=''+THIS.get('class_id')+''>');
                        $('#frm_dummy').append('<input type='hidden' name='class_name' value=''+THIS.get('class_name')+''>');
                        $('#frm_dummy').append('<input type='hidden' name='refer' value=''+core.fetch.path('register-student', {})+''>');
                        $j('#frm_dummy').append('<input type="hidden" name="origin" value="'+window.location.origin+'">');
                        $('#frm_dummy').attr('action', '/core/services/create_student_account_prep.php').submit();*/
              THIS.services.gotoStudentRegistration({
                code: THIS.get('code'),
                class_id: THIS.get('class_id'),
                class_name: THIS.get('class_name')
              })
              event.preventDefault()
            })
        }
      }
    },
    student_expired: function () {
      return {
        name: 'student_expired',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_student_expired').off()
          $j('#close_student_expired')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'student_expired'
              })
              event.preventDefault()
            })

          $j('#student_expired_renew_now').off()
          $j('#student_expired_renew_now')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('renew', {})
              event.preventDefault()
            })

          $j('#student_expired_ask_us').off()
          $j('#student_expired_ask_us')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('askus', {})
              event.preventDefault()
            })

          $j('#student_expired_link_now').off()
          $j('#student_expired_link_now')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              event.preventDefault()
            })
        }
      }
    },
    student_game_login_offer: function () {
      return {
        name: 'student_game_login_offer',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_student_game_login_offer').off()
          $j('#close_student_game_login_offer')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'student_game_login_offer'
              })
              event.preventDefault()
            })

          $j('#student_game_log_in').off()
          $j('#student_game_log_in')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
        }
      }
    },
    student_quiz_login_offer: function () {
      return {
        name: 'student_quiz_login_offer',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_student_quiz_login_offer').off()
          $j('#close_student_quiz_login_offer')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'student_quiz_login_offer'
              })
              event.preventDefault()
            })

          $j('#student_quiz_log_in').off()
          $j('#student_quiz_log_in')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
        }
      }
    },
    student_joined_class: function () {
      return {
        name: 'student_joined_class',
        onOpen: function () {
          this.events()
          if (THIS.get('class_name') === '') {
            THIS.set('class_name', core.persistentData.get('class_name', true))
          }
          $j('#student_joined_class_name').html(THIS.get('class_name'))
        },
        onClose: function () {},
        events: function () {
          $j('#close_student_joined_class').off()
          $j('#close_student_joined_class')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'student_joined_class'
              })
              event.preventDefault()
            })
        }
      }
    },
    teacher_basic_my_brainpop: function () {
      return {
        name: 'teacher_basic_my_brainpop',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_teacher_basic_my_brainpop').off()
          $j('#close_teacher_basic_my_brainpop')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_basic_my_brainpop'
              })
              event.preventDefault()
            })
        }
      }
    },
    teacher_expired: function () {
      return {
        name: 'teacher_expired',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_teacher_expired').off()
          $j('#close_teacher_expired')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_expired'
              })
              event.preventDefault()
            })

          $j('#teacher_expired_renew_now').off()
          $j('#teacher_expired_renew_now')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('renew', {})
              event.preventDefault()
            })

          $j('#teacher_expired_ask_us').off()
          $j('#teacher_expired_ask_us')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('askus', {})
              event.preventDefault()
            })

          $j('#teacher_expired_link_now').off()
          $j('#teacher_expired_link_now')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_educators_code'
              })
              event.preventDefault()
            })
        }
      }
    },
    teacher_linked_basic: function () {
      return {
        name: 'teacher_linked_basic',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_teacher_linked_basic').off()
          $j('#close_teacher_linked_basic')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_linked_basic'
              })
              event.preventDefault()
            })

          $j('#log_in_to_your_school_account').off()
          $j('#log_in_to_your_school_account')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
        }
      }
    },
    teacher_missing_info: function () {
      return {
        name: 'teacher_missing_info',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#teacher_first_name'),
                text: core.translations.get('teacher_first_name_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#teacher_last_name'),
                text: core.translations.get('teacher_last_name_hint', THIS.get('tcontext'))
              }
            ]
          })
          $j('#teacher_first_name').focus()
        },
        onClose: function () {
          $j('#teacher_first_name, #teacher_last_name').val('')
          $j('#update_teacher_info').removeClass('disabled')
          $j('.teacher_missing_info_errors').hide()
        },
        events: function () {
          $j('#close_teacher_missing_info').off()
          $j('#close_teacher_missing_info')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_missing_info'
              })
              event.preventDefault()
            })

          $j('#teacher_last_name, #teacher_first_name').off()
          $j('#teacher_last_name, #teacher_first_name').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#update_teacher_info').trigger('click')
            }
          })

          $j('#update_teacher_info').off()
          $j('#update_teacher_info')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#update_teacher_info').hasClass('disabled')) {
                $j('#update_teacher_info').addClass('disabled')
                $j('.teacher_missing_info_errors').hide()
                if ($j('#teacher_first_name').val() === '') {
                  $j('#teacher_first_name_missing_error_placeholder').fadeIn()
                  $j('#teacher_first_name').focus()
                  $j('#update_teacher_info').removeClass('disabled')
                } else if ($j('#teacher_last_name').val() === '') {
                  $j('#teacher_last_name_missing_error_placeholder').fadeIn()
                  $j('#teacher_last_name').focus()
                  $j('#update_teacher_info').removeClass('disabled')
                } else {
                  core.accounts.updateAccount({
                    async: true,
                    first_name: $j('#teacher_first_name').val(),
                    last_name: $j('#teacher_last_name').val(),
                    account_id: core.user.id(),
                    onSuccess: THIS.callbacks.teacherAccountUpdated,
                    onFailure: THIS.callbacks.teacherAccountUpdateFailed
                  })
                }
              }
              event.preventDefault()
            })
        }
      }
    },
    teacher_missing_info_updated: function () {
      return {
        name: 'teacher_missing_info_updated',
        onOpen: function () {
          this.events()
        },
        onClose: function () {},
        events: function () {
          $j('#close_teacher_missing_info_updated').off()
          $j('#close_teacher_missing_info_updated')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_missing_info_updated'
              })
              event.preventDefault()
            })
        }
      }
    },
    teacher_unlinked: function () {
      return {
        name: 'teacher_unlinked',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_teacher_unlinked').off()
          $j('#close_teacher_unlinked')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_unlinked'
              })
              event.preventDefault()
            })

          $j('#unlinked_educator_get_started').off()
          $j('#unlinked_educator_get_started')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_educators_code'
              })
              event.preventDefault()
            })
        }
      }
    },
    teacher_unlinked_with_history: function () {
      return {
        name: 'teacher_unlinked_with_history',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_teacher_unlinked_with_history').off()
          $j('#close_teacher_unlinked_with_history')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_unlinked_with_history'
              })
              event.preventDefault()
            })

          $j('#unlinked_educator_history_get_started').off()
          $j('#unlinked_educator_history_get_started')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_educators_code'
              })
              event.preventDefault()
            })
        }
      }
    },
    verify_educator_login: function () {
      return {
        name: 'verify_educator_login',
        onOpen: function () {
          this.events()
          var sso_provioned = core.user.sso().sso_provisioned
          if (sso_provioned == 'Yes') {
            /* SSO PROVISIONED SET UP */
            $j('#verify_educator_sso_provisoned').show()
            core.watermark.set({
              inputs_arr: [
                {
                  obj: $j('#educator_token'),
                  text: core.translations.get('user_token_hint', THIS.get('tcontext'))
                }
              ]
            })
            $j('#educator_token').focus()
          } else {
            /* NON SSO PROVISIONED SET UP */
            $j('#verify_educator_non_sso_provisoned').show()
            core.watermark.set({
              inputs_arr: [
                {
                  obj: $j('#educator_username'),
                  text: core.translations.get('educator_username_hint', THIS.get('tcontext'))
                },
                {
                  obj: $j('#educator_password'),
                  text: core.translations.get('educator_password_hint', THIS.get('tcontext'))
                }
              ]
            })
            core.restrict.username($j('#educator_username'))
            //core.restrict.password( $j('#educator_password') );
            $j('#educator_username').focus()
          }
        },
        events: function () {
          var sso_provioned = core.user.sso().sso_provisioned

          $j('#close_verify_educator_login').off()
          $j('#close_verify_educator_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              $j('#educator_username, #educator_password').val('')
              THIS.toggle.panelByName({
                panel_name: 'verify_educator_login'
              })
              event.preventDefault()
            })

          $j('#educator_username, #educator_password').off()
          $j('#educator_username, #educator_password').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#verify_educator_login_submit').trigger('click')
            }
          })

          if (sso_provioned == 'Yes') {
            /* SSO PROVISIONED EVENTS */
            $j('#verify_educator_token_not_now').off()
            $j('#verify_educator_token_not_now')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                window.location.href = core.fetch.path('sso_login', {
                  parent: 'true'
                })
                event.preventDefault()
              })

            $j('#verify_educator_token').off()
            $j('#verify_educator_token')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                if (!$j('#verify_educator_token_submit').hasClass('disabled')) {
                  $j('#verify_educator_token_submit').addClass('disabled')
                  $j('.frm_educator_token_errors').hide()
                  if ($j('#educator_token').val() === '') {
                    $j('#educator_token_error_placeholder').fadeIn()
                    $j('#educator_token').focus()
                    $j('#verify_educator_token_submit').removeClass('disabled')
                  } else {
                    core.accounts.confirmAccountLoginToken({
                      token: $j('#educator_token').val(),
                      onSuccess: THIS.callbacks.educatorLoginConfirmed,
                      onFailure: THIS.callbacks.educatorLoginConfirmationFailed
                    })
                  }
                }
                event.preventDefault()
              })

            $j('#send_educator_token_not_now').off()
            $j('#send_educator_token_not_now')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                window.location.href = core.fetch.path('sso_login', {
                  parent: 'true'
                })
                event.preventDefault()
              })

            $j('#send_educator_token').off()
            $j('#send_educator_token')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                core.accounts.sendUserToken({
                  id: core.user.sso().teacher_account_id,
                  language: THIS.get('language'),
                  onSuccess: function () {
                    // EMAIL SENT TO USER
                    $j('#educator_token_step1').hide()
                    $j('#educator_token_step2').fadeIn()
                    $j('#educator_token').focus()
                  }
                })
                event.preventDefault()
              })
          } else {
            /* NON SSO PROVISIONED EVENTS */
            $j('#verify_educator_login_submit').off()
            $j('#verify_educator_login_submit')
              .on('click', THIS.callbacks.disableDBLClick)
              .on('click', function (event) {
                if (!$j('#verify_educator_login_submit').hasClass('disabled')) {
                  $j('#verify_educator_login_submit').addClass('disabled')
                  $j('.frm_educator_login_errors').hide()
                  if ($j('#educator_username').val() === '') {
                    $j('#educator_username_error_placeholder').fadeIn()
                    $j('#educator_username').focus()
                    $j('#verify_educator_login_submit').removeClass('disabled')
                  } else if ($j('#educator_password').val() === '') {
                    $j('#educator_password_error_placeholder').fadeIn()
                    $j('#educator_password').focus()
                    $j('#verify_educator_login_submit').removeClass('disabled')
                  } else {
                    core.accounts.confirmAccountLogin({
                      async: true,
                      username: $j('#educator_username').val(),
                      language: THIS.get('language'),
                      code: '',
                      password: $j('#educator_password').val(),
                      context: THIS.get('context'),
                      onSuccess: THIS.callbacks.educatorLoginConfirmed,
                      onFailure: THIS.callbacks.educatorLoginConfirmationFailed
                    })
                  }
                }
                event.preventDefault()
              })
          }
        }
      }
    },
    verify_school_login: function () {
      return {
        name: 'verify_school_login',
        onOpen: function () {
          if (THIS.get('action') == 'code_verification') {
            $j('#school_cred_verification_message').show()
          } else {
            $j('#school_cred_help_message').show()
          }
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#school_username'),
                text: core.translations.get('brainpop_username_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#school_password'),
                text: core.translations.get('brainpop_password_hint', THIS.get('tcontext'))
              }
            ]
          })
          core.restrict.username($j('#school_username'))
          //core.restrict.password( $j('#school_password') );
          $j('#school_username, #school_password').val('')
          $j('#verify_school_login_submit').removeClass('disabled')
          $j('#school_username').focus()
        },
        events: function () {
          $j('#verify_school_login_submit').off()
          $j('#verify_school_login_submit')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#verify_school_login_submit').hasClass('disabled')) {
                $j('#verify_school_login_submit').addClass('disabled')
                $j('.frm_school_login_errors').hide()
                if ($j('#school_username').val() === '') {
                  $j('#school_username_error_placeholder').fadeIn()
                  $j('#school_username').focus()
                  $j('#verify_school_login_submit').removeClass('disabled')
                } else if ($j('#school_password').val() === '') {
                  $j('#school_password_error_placeholder').fadeIn()
                  $j('#school_password').focus()
                  $j('#verify_school_login_submit').removeClass('disabled')
                } else {
                  core.accounts.confirmAccountLogin({
                    async: true,
                    username: $j('#school_username').val(),
                    language: THIS.get('language'),
                    code: THIS.get('code'),
                    password: $j('#school_password').val(),
                    context: THIS.get('context'),
                    onSuccess: THIS.callbacks.schoolLoginConfirmed,
                    onFailure: THIS.callbacks.schoolLoginConfirmationFailed
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_verify_school_login').off()
          $j('#close_verify_school_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'verify_school_login'
              })
              event.preventDefault()
            })

          $j('#school_username, #school_password').off()
          $j('#school_username, #school_password').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#verify_school_login_submit').trigger('click')
            }
          })
        }
      }
    },
    verify_student_login: function () {
      return {
        name: 'verify_student_login',
        onOpen: function () {
          this.events()
          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#student_username'),
                text: core.translations.get('student_username_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#student_password'),
                text: core.translations.get('student_password_hint', THIS.get('tcontext'))
              }
            ]
          })
          core.restrict.username($j('#student_username'))
          //core.restrict.password( $j('#student_password') );
          $j('#code_enrollment_limit_reached_students_placeholder').hide()
          if (THIS.get('class_name') !== '') {
            $j('#student_login_class_name').html(THIS.get('class_name'))
          } else {
            $j('.student_login_message').hide()
          }

          if (core.user.sso().active !== undefined) {
            $j('.verify_student_login_sso_excluded').hide()
          }

          $j('#student_username').focus()
        },
        events: function () {
          $j('#verify_student_login_submit').off()
          $j('#verify_student_login_submit')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#verify_student_login_submit').hasClass('disabled')) {
                $j('#verify_student_login_submit').addClass('disabled')
                $j('.frm_student_login_errors').hide()
                if ($j('#student_username').val() === '') {
                  $j('#student_username_error_placeholder').fadeIn()
                  $j('#student_username').focus()
                  $j('#verify_student_login_submit').removeClass('disabled')
                } else if ($j('#student_password').val() === '') {
                  $j('#student_password_error_placeholder').fadeIn()
                  $j('#student_password').focus()
                  $j('#verify_student_login_submit').removeClass('disabled')
                } else {
                  core.accounts.confirmAccountLogin({
                    async: true,
                    username: $j('#student_username').val(),
                    language: THIS.get('language'),
                    code: '',
                    password: $j('#student_password').val(),
                    context: THIS.get('context'),
                    onSuccess: THIS.callbacks.studentLoginConfirmed,
                    onFailure: THIS.callbacks.studentLoginConfirmationFailed
                  })
                }
              }
              event.preventDefault()
            })

          $j('#close_verify_student_login').off()
          $j('#close_verify_student_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'verify_student_login'
              })
              event.preventDefault()
            })

          $j('#student_username, #student_password').off()
          $j('#student_username, #student_password').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#verify_student_login_submit').trigger('click')
            }
          })

          $j('.forgot_password').off()
          $j('.forgot_password')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.open(core.fetch.path('password-reminder', {}))
              event.preventDefault()
            })

          $j('#student_sign_up').off()
          $j('#student_sign_up')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (THIS.get('maxed_enr_reached') === 'true') {
                $j('#code_enrollment_limit_reached_students_placeholder').fadeIn()
              } else {
                $j('#frm_dummy').append('<input type="hidden" name="code" value="' + THIS.get('code') + '">')
                $j('#frm_dummy').append('<input type="hidden" name="class_id" value="' + THIS.get('class_id') + '">')
                $j('#frm_dummy').append('<input type="hidden" name="class_name" value="' + THIS.get('class_name') + '">')
                $j('#frm_dummy').append('<input type="hidden" name="refer" value="' + core.fetch.path('register-student', {}) + '">')
                $j('#frm_dummy').append('<input type="hidden" name="origin" value="' + window.location.origin + '">')
                $j('#frm_dummy').attr('action', '/core/services/create_student_account_prep.php').submit()
              }
              event.preventDefault()
            })
        }
      }
    },
    whats_a_code: function () {
      return {
        name: 'whats_a_code',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#whats_a_code_back').off()
          $j('#whats_a_code_back')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: core.persistentData.get('caller', true)
              })
              event.preventDefault()
            })

          $j('#whats_a_code_teacher_help').off()
          $j('#whats_a_code_teacher_help')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('action', 'code_help')
              THIS.toggle.panelByName({
                panel_name: 'verify_school_login'
              })
              event.preventDefault()
            })
        }
      }
    },
    teacher_code_help: function () {
      return {
        name: 'teacher_code_help',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#teacher_help_get_code_back_button').off()
          $j('#teacher_help_get_code_back_button')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_code'
              })
              event.preventDefault()
            })

          $j('#close_teacher_code_help').off()
          $j('#close_teacher_code_help')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'teacher_code_help'
              })
              event.preventDefault()
            })

          $j('#teacher_help_me_get_my_code_link').off()
          $j('#teacher_help_me_get_my_code_link')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.set('action', 'code_help')
              THIS.services.processSchool({})
              event.preventDefault()
            })
        }
      }
    },
    student_code_help: function () {
      return {
        name: 'student_code_help',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#student_help_get_code_back_button').off()
          $j('#student_help_get_code_back_button')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'enter_code'
              })
              event.preventDefault()
            })

          $j('#close_student_code_help').off()
          $j('#close_student_code_help')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'student_code_help'
              })
              event.preventDefault()
            })
        }
      }
    },
    educators_relink_confirmation: function () {
      return {
        name: 'educators_relink_confirmation',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#relink_approve').off()
          $j('#relink_approve')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'educators_relink_confirmation2'
              })
              event.preventDefault()
            })

          $j('#close_educators_relink_confirmation, #relink_close, #cancel_educators_relink_confirmation').off()
          $j('#close_educators_relink_confirmation, #relink_close, #cancel_educators_relink_confirmation')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'educators_relink_confirmation'
              })
              event.preventDefault()
            })
        }
      }
    },
    educators_relink_confirmation2: function () {
      return {
        name: 'educators_relink_confirmation2',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#relink_approve2').off()
          $j('#relink_approve2')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              var sub_level = core.user.subscription_level()
              if ((sub_level !== undefined && sub_level === 'premium') || THIS.get('edu_acct_id') !== '') {
                // LOGGED ON USER WITH A PREMIUM ACCOUNT, SIMPLE RELINKING
                THIS.services.linkAccount()
              } else {
                switch (THIS.get('sso_action')) {
                  case 'autologin':
                    window.location.href = core.fetch.path('sso_login', {})
                    break
                  case 'auto_create_educator':
                    var create_url = core.fetch.path('sso_create_educator', {
                      parent_id: THIS.get('tmp').id
                    })
                    if (core.user.missingSSOInfo('teacher')) {
                      THIS.set('sso_missing_info', {
                        url: create_url,
                        type: 'teacher'
                      })
                      THIS.toggle.panelByName({
                        panel_name: 'sso_missing_info'
                      })
                    } else {
                      window.location.href = create_url
                    }
                    break
                }
              }
              event.preventDefault()
            })

          $j('#close_educators_relink_confirmation2, #relink_close2, #cancel_educators_relink_confirmation2').off()
          $j('#close_educators_relink_confirmation2, #relink_close2, #cancel_educators_relink_confirmation2')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'educators_relink_confirmation2'
              })
              event.preventDefault()
            })
        }
      }
    },
    sso_error: function () {
      return {
        name: 'sso_error',
        onOpen: function () {
          this.events()
          // DISPLAY PROPER MESSAGE BASED ON ERROR TYPE
          var errors = core.services.getErrorCodes()
          var sso = core.user.sso()
          switch (sso.error_code) {
            case errors.ACCOUNT_EXPIRED:
              $j('#sso_expired_message').show()
              break
            case errors.ACCOUNT_NOT_ACTIVE:
              $j('#sso_inactive_message').show()
              break
            case errors.ERROR_ACCOUNT_NOT_FOUND:
              $j('#sso_account_not_found_message').show()
              $j('#log_in_from_error_message').off()
              $j('#log_in_from_error_message')
                .on('click', THIS.callbacks.disableDBLClick)
                .on('click', function (event) {
                  THIS.toggle.panelByName({
                    panel_name: 'login'
                  })
                  event.preventDefault()
                })
              break
            default:
              $j('#sso_generic_error_message').show()
              break
          }
        },
        events: function () {
          $j('#close_sso_error').off()
          $j('#close_sso_error')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'sso_error'
              })
              event.preventDefault()
            })
        }
      }
    },
    sso_missing_info: function () {
      return {
        name: 'sso_missing_info',
        onOpen: function () {
          this.events()

          $j('#update_sso_info').removeClass('disabled')
          $j('.sso_missing_info_errors').hide()

          core.watermark.set({
            inputs_arr: [
              {
                obj: $j('#sso_first_name'),
                text: core.translations.get('teacher_first_name_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#sso_last_name'),
                text: core.translations.get('teacher_last_name_hint', THIS.get('tcontext'))
              },
              {
                obj: $j('#sso_email'),
                text: core.translations.get('request_code_email_watermark', THIS.get('tcontext'))
              }
            ]
          })

          core.restrict.email($j('#sso_email'), function () {})

          var info = THIS.get('sso_missing_info')
          if (info === '' || info === undefined) {
            info = core.user.sso()
          }
          var user_type = THIS.get('i_am_a')
          if (user_type === '') {
            user_type = info.user_type
          }

          // ON SEARCH INPUT ENTER CLICK
          $j('#sso_first_name, #sso_last_name, #sso_email').keyup(function (e) {
            if (e.keyCode == 13) {
              $j('#update_sso_info').trigger('click')
            }
          })

          if (info.first_name !== '') {
            $j('#sso_first_name').val(info.first_name)
          }
          if (info.last_name !== '') {
            $j('#sso_last_name').val(info.last_name)
          }

          if (user_type == 'teacher') {
            $j('#sso_missing_email_div').show()
            if (info.email !== '') {
              $j('#sso_email').val(info.email)
            }
          }

          if (core.services.empty($j('#sso_first_name').val())) {
            $j('#sso_first_name').focus()
          } else if (core.services.empty($j('#sso_last_name').val())) {
            $j('#sso_last_name').focus()
          } else if (core.services.empty($j('#sso_email').val()) && user_type == 'teacher') {
            $j('#sso_email').focus()
          }

          $j('#update_sso_info').off()
          $j('#update_sso_info')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              if (!$j('#update_sso_info').hasClass('disabled')) {
                $j('#update_sso_info').addClass('disabled')

                $j('.sso_missing_info_errors').hide()

                if (core.services.empty($j('#sso_first_name').val())) {
                  $j('#sso_first_name_missing_error_placeholder').fadeIn()
                  $j('#sso_first_name').focus()
                  $j('#update_sso_info').removeClass('disabled')
                } else if (core.services.empty($j('#sso_last_name').val())) {
                  $j('#sso_last_name_missing_error_placeholder').fadeIn()
                  $j('#sso_last_name').focus()
                  $j('#update_sso_info').removeClass('disabled')
                } else if (core.services.empty($j('#sso_email').val()) && user_type == 'teacher') {
                  $j('#sso_email_missing_error_placeholder').fadeIn()
                  $j('#sso_email').focus()
                  $j('#update_sso_info').removeClass('disabled')
                } else if (!core.services.empty($j('#sso_email').val()) && !core.services.validateEmail($j('#sso_email').val())) {
                  // INVALID EMAIL
                  $j('#sso_email_invalid_error_placeholder').fadeIn()
                  $j('#sso_email').focus()
                  $j('#update_sso_info').removeClass('disabled')
                } else {
                  // SUBMIT
                  $j('#frm_dummy').append('<input type="hidden" name="user_type" value="' + user_type + '">')
                  $j('#frm_dummy').append('<input type="hidden" name="first_name" value="' + $j('#sso_first_name').val() + '">')
                  $j('#frm_dummy').append('<input type="hidden" name="last_name" value="' + $j('#sso_last_name').val() + '">')
                  if (user_type == 'teacher') {
                    $j('#frm_dummy').append('<input type="hidden" name="email" value="' + $j('#sso_email').val() + '">')
                  }
                  $j('#frm_dummy').attr('action', core.fetch.path('sso_restart', {})).submit()
                }
              }
              event.preventDefault()
            })
        },
        events: function () {
          $j('#close_sso_missing_info').off()
          $j('#close_sso_missing_info')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'sso_missing_info'
              })
              event.preventDefault()
            })
        }
      }
    },
    mam_premium_subscription: function () {
      return {
        name: 'mam_premium_subscription',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_mam_premium_subscription').off()
          $j('#close_mam_premium_subscription')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'mam_premium_subscription'
              })
              event.preventDefault()
            })

          $j('#mam_premium_subscription_login').off()
          $j('#mam_premium_subscription_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })
        }
      }
    },
    mam_basic_subscription: function () {
      return {
        name: 'mam_basic_subscription',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('.what_is_mybp_link').off()
          $j('.what_is_mybp_link')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('what-is-mybp', {})
              event.preventDefault()
            })

          $j('#close_mam_basic_subscription').off()
          $j('#close_mam_basic_subscription')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'mam_basic_subscription'
              })
              event.preventDefault()
            })
        }
      }
    },
    mam_not_logged_in: function () {
      return {
        name: 'mam_not_logged_in',
        onOpen: function () {
          this.events()
        },
        events: function () {
          $j('#close_mam_not_logged_in').off()
          $j('#close_mam_not_logged_in')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'mam_not_logged_in'
              })
              event.preventDefault()
            })

          $j('#mam_not_logged_in_login').off()
          $j('#mam_not_logged_in_login')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              THIS.toggle.panelByName({
                panel_name: 'login'
              })
              event.preventDefault()
            })

          $j('.what_is_mybp_link').off()
          $j('.what_is_mybp_link')
            .on('click', THIS.callbacks.disableDBLClick)
            .on('click', function (event) {
              window.location.href = core.fetch.path('what-is-mybp', {})
              event.preventDefault()
            })
        }
      }
    }
  }
  this.services = {
    doesDialogShouldOpen: function (dialog_name) {
      var dialog = core.persistentData.get(dialog_name, true)
      if (dialog !== null && dialog !== undefined && dialog !== '') {
        if (dialog == 'never') {
          return false
        } else {
          var myDate = new Date()
          return myDate.getTime() / 1000 > dialog ? true : false
        }
      }
      return true
    },
    getErrorMessage: function (json) {
      var message = ''
      switch (json.state) {
        case 1:
          message = core.translations.get('error_account_not_found', THIS.get('tcontext'))
          break
        case 2:
          message = core.translations.get('error_account_expired', THIS.get('tcontext'))
          break
        case 3:
          message = core.translations.get('error_account_not_active', THIS.get('tcontext'))
          break
        case 4:
          message = core.translations.get('error_non_linked_educators_account', THIS.get('tcontext'))
          break
        case 5:
          message = core.translations.get('error_bad_login', THIS.get('tcontext'))
          break
        case 6:
          message = core.translations.get('error_missing_username', THIS.get('tcontext'))
          break
        case 7:
          message = core.translations.get('error_missing_password', THIS.get('tcontext'))
          break
      }
      return message
    },
    getOptions: function () {
      return {
        i_am_a: '',
        panel_open: false,
        panel_open_with: '',
        open_panel_on_close: '',
        context: '',
        user_type: '',
        subscription: '',
        parent_subscription: '',
        parent_status: '',
        verified: '',
        language: '',
        dialogs_later_timing_in_days: '1',
        colorscheme: 'default',
        auto_expand: 'yes',
        login_on_cancel: '',
        link_educator: '',
        product: '',
        code: '',
        school_acct_id: '',
        school_name: '',
        school_contact_name: '',
        edu_acct_id: '',
        student_acct_id: '',
        acct_id: '',
        class_id: '',
        class_name: '',
        action: '',
        tcontext: 'core',
        sso_action: '',
        sso_action_override: '',
        sso_missing_info: '',
        force_login_type: '',
        maxed_enr_reached: '',
        tmp: ''
      }
    },
    hasContextPermission: function (context) {
      return core.user.permissions()[context] === 'true' ? true : false
    },
    joinClass: function () {
      if (THIS.get('student_acct_id') === '' || THIS.get('code') === '' || THIS.get('class_id') === '') {
        THIS.toggle.error({
          state: '12',
          message: 'Invalid param set'
        })
      } else {
        // JOIN CLASS
        core.accounts.addStudentToClass({
          async: true,
          class_id: THIS.get('class_id'),
          student_id: THIS.get('student_acct_id'),
          code: THIS.get('code'),
          onSuccess: THIS.callbacks.studentJoinedClass,
          onFailure: THIS.callbacks.studentJoinedClassFailed
        })
      }
    },
    linkAccount: function () {
      if (THIS.get('edu_acct_id') === '' || THIS.get('school_acct_id') === '' || THIS.get('code') === '') {
        THIS.toggle.error({
          state: '13',
          message: 'Invalid param set'
        })
      } else {
        core.services.clearSessionInfo({})
        // LINK ACCOUNT
        core.accounts.linkEduSchoolAccounts({
          async: true,
          code: THIS.get('code'),
          school_acct_id: THIS.get('school_acct_id'),
          edu_acct_id: THIS.get('edu_acct_id'),
          language: THIS.get('language'),
          onSuccess: THIS.callbacks.accountLinked,
          onFailure: THIS.callbacks.accountLinkedFailed
        })
      }
    },
    login: function (params) {
      if (params.username !== undefined && params.password !== undefined) {
        $j('#frm_username').val(params.username)
        $j('#frm_password').val(params.password)
        var sso = core.user.sso()
        $j('#frm_sso_id').val(sso.id !== undefined ? sso.id : '')
        $j('#frm_sso_type').val(sso.type !== undefined ? sso.type : '')
        if (params.refer !== undefined && params.refer !== undefined) {
          $j('#frm_refer').val(params.refer)
        }

        var login_path = ''
        switch (THIS.get('product')) {
          case 'educators':
            login_path = '/educators/loginDo.weml'
            break
          case 'brainpop':
            login_path = '/user/loginDo.weml'
            break
          case 'brainpopjr':
            login_path = '/user/loginDo.weml'
            break
          case 'brainpopesl':
            login_path = '/user/loginDo.weml'
            break
          default:
            login_path = '/user/loginDo.weml'
        }
        $j('#frm_login').attr('action', login_path)
        $j('#frm_login').submit()
      }
    },
    panelClosed: function (obj) {
      if ($j(obj).hasClass('close_for_session')) {
        var tmp_obj = {}
        tmp_obj['dont_show_panel_' + $j(obj).attr('id').replace('close_', '')] = true
        core.persistentData.set(tmp_obj, true)
      }
    },
    processEduAccount: function () {
      if (core.user.loggedIn() && core.user.userType() == 'teacher') {
        // LOGGED IN WITH AN EDUCATOR ACCOUNT
        THIS.set('edu_acct_id', core.user.id()) // PREPARE PARAMS FOR THE ACCOUNT LINKING
        if (core.user.subscription_level() === 'premium') {
          // MEANS THIS EDUACTOR ACCOUNT ALREADY HAS AN ACCOUNT AND IF WE RELINK HIM ALL OLD DATA WILL BE REMOVED.
          THIS.toggle.panelByName({
            panel_name: 'educators_relink_confirmation'
          })
        } else {
          // DIRECTLY LINK THE ACCOUNT
          THIS.services.linkAccount()
        }
      } else {
        // EVEN IF USER IS NOT LOGGED IN, MAKE SURE THE ACCOUNT IS NOT ALREADY LINKED TO A PARENT. IF SO, OFFER WARNING.
        THIS.toggle.panelByName({
          panel_name: 'educators_account_state'
        })
      }
    },
    processSchool: function (params) {
      var user_logged_in = core.user.loggedIn()
      var school_info = core.user.schoolInfo()

      if (user_logged_in && school_info.id !== '' && core.user.subscription_level() != 'none' && core.user.subscription_level() != 'basic' && core.user.subscription_level() != 'expired' && core.user.userType() != 'teacher' && core.user.userType() != 'student') {
        // LOGGED IN WITH A SCHOOL ACCOUNT. SAVE SCHOOL ID
        THIS.set('school_acct_id', core.user.id())
        THIS.set('school_contact_name', school_info.contact_name)
        THIS.set('school_name', school_info.name)
      }

      if (THIS.get('school_acct_id') === '' || THIS.get('school_acct_id') === undefined || THIS.get('school_acct_id') === null) {
        // NO SCHOOL ID. OPEN SCHOOL VERIFICATION DIALOG
        THIS.toggle.panelByName({
          panel_name: 'verify_school_login'
        })
      } else {
        // SCHOOL ACCOUNT ID EXIST
        if (THIS.get('sso_action') !== '') {
          switch (THIS.get('sso_action')) {
            case 'register_educator':
              var create_url = core.fetch.path('sso_create_educator', {
                parent_id: THIS.get('school_acct_id')
              })
              if (core.user.missingSSOInfo('teacher')) {
                THIS.set('sso_missing_info', {
                  url: create_url,
                  type: 'teacher'
                })
                THIS.toggle.panelByName({
                  panel_name: 'sso_missing_info'
                })
              } else {
                window.location.href = create_url
              }
              break
          }
        } else {
          switch (THIS.get('action')) {
            case 'code_verification':
              THIS.services.processEduAccount()
              break
            case 'code_help':
              THIS.toggle.panelByName({
                panel_name: 'help_educator_get_code_step2'
              })
              break
            default:
              THIS.toggle.panelByName({
                panel_name: 'help_educator_get_code_step2'
              })
              break
          }
        }
      }
    },
    processStudent: function () {
      if (core.user.loggedIn() && core.user.userType() == 'student') {
        if (THIS.get('code') !== '') {
          // LOGGED IN AS STUDENT + CODE. JOIN CLASS
          THIS.set('student_acct_id', core.user.id())
          THIS.services.joinClass()
        } else {
        }
      } else {
        // VERIFY STUDENT LOGIN
        THIS.toggle.panelByName({
          panel_name: 'verify_student_login'
        })
      }
    },
    setSearchMode: function (mode) {
      if (mode !== '') {
        switch (mode) {
          case 'educators':
            $j('#frm_search').attr('action', '/educators/community/')
            $j('#frm_keyword').attr('name', 's')
            break
          case 'main':
            $j('#frm_search').attr('action', '/search/search.weml')
            $j('#frm_keyword').attr('name', 'keyword')
            break
          default:
            $j('#frm_search').attr('action', '/search/search.weml')
            $j('#frm_keyword').attr('name', 'keyword')
            break
        }
      }
    },
    shouldPanelOpen: function (panel_name) {
      if ($j('#close_' + panel_name).hasClass('close_for_session')) {
        return !core.persistentData.get('dont_show_panel_' + panel_name, true)
      }
      return true
    },
    gotoEducatorRegistration: function (params) {
      $j('#frm_dummy').append('<input type="hidden" name="code" value="' + params.code + '">')
      $j('#frm_dummy').append('<input type="hidden" name="school_id" value="' + params.school_id + '">')
      $j('#frm_dummy').append('<input type="hidden" name="school_name" value="' + params.school_name + '">')
      $j('#frm_dummy').append('<input type="hidden" name="refer" value="' + core.fetch.path('register-educator', {}) + '">')
      $j('#frm_dummy').append('<input type="hidden" name="origin" value="' + window.location.origin + '">')
      $j('#frm_dummy').attr('action', '/core/services/create_educators_account_prep.php').submit()
    },
    gotoStudentRegistration: function (params) {
      $('#frm_dummy').append('<input type="hidden" name="code" value="' + params.code + '">')
      $('#frm_dummy').append('<input type="hidden" name="class_id" value="' + params.class_id + '">')
      $('#frm_dummy').append('<input type="hidden" name="class_name" value="' + params.class_name + '">')
      $('#frm_dummy').append('<input type="hidden" name="refer" value="' + core.fetch.path('register-student', {}) + '">')
      $j('#frm_dummy').append('<input type="hidden" name="origin" value="' + window.location.origin + '">')
      $('#frm_dummy').attr('action', '/core/services/create_student_account_prep.php').submit()
    }
  }
}.apply(UtilityBar))

//@ sourceURL=utility-bar.js
