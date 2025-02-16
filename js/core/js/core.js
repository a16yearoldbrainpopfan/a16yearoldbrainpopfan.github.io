var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

"use strict";
function core(){}
(function(){
    var THIS = this;
    var $j = jQuery;
    this.init = function(params){
        THIS.set('coreObj', $j.extend({}, {'settings' : THIS.fetch.settings()})); // LOAD CORE SETTINGS
        var mandatory_resources =[THIS.get('resources').jquery_modernaizer];
        THIS.resources.load({resources_arr : mandatory_resources, load_params : {}, onLoadComplete : function(){
            if(localStorage.getItem('core_version') != THIS.get('coreObj').settings.version){
                localStorage.setItem('core_version', THIS.get('coreObj').settings.version);
                //localStorage.clear();
            }
            THIS.define.hacks();
            THIS.define.events();  // DEFINE PAGE EVENTS
            THIS.services.debugMessage({method_name : 'core.init', message : 'Resources loaded. Initiating.', state : 'complete', objects : {settings : THIS.get('coreObj').settings, paths : THIS.get('coreObj').settings.paths, user_info : THIS.get('coreObj').settings.user_info}});
            THIS.set('ready', true);
        }});
    };
    this.get = function(key){
        return (members[key]);
    };
    this.set = function(key, value){
        if(THIS.services.defined(members[key])){
            members[key] = value;
        }
    };
    var members = {
        ready : false,
        coreObj : '',   //  THE BP CORE OBJECT
        persistent_data_cookie : 'bpcore',  // THE COOKIE IN WHICH USER PERSISTENT DATA WILL BE SAVED IF LOCAL STORAGE IS NOT ENABLED,
        notifications_type: 'growl',
        resources : {
            jquery_ui               :   {url : '/libs/jquery/jquery-ui.min.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_autocomplete     :   {url : '/libs/jquery/jquery.autocomplete.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_base64           :   {url : '/libs/jquery/jquery.base64.min.js', state : '', type : 'js', isLoaded : function(){return( (jQuery.base64!==undefined) )}},
            jquery_blockui          :   {url : '/libs/jquery/jquery.blockUI.custom.min.js', state : '', type : 'js', isLoaded : function(){return( ($j.blockUI!==undefined) )}},
            jquery_blockui_css      :   {url : '/blockui.css', state : '', type : 'css', isLoaded : function(){return( false )}},
            bp_utility_bar          :   {url : '/utility_bar.css', state : '', type : 'css', isLoaded : function(){return( false )}},
            jquery_cookie           :   {url : '/libs/jquery/jquery.cookie.min.js', state : '', type : 'js', isLoaded : function(){return( (jQuery.cookie!==undefined) )}},
            jquery_json             :   {url : '/libs/jquery/json2.min.js', state : '', type : 'js', isLoaded : function(){return( (typeof JSON==="object") )}},
            jquery_ui_css           :   {url : '/jquery-ui.min.css', state : '', type : 'css', isLoaded : function(){return( (false) )}},
            jquery_autocomplete_css :   {url : '/jquery.autocomplete.min.css', state : '', type : 'css', isLoaded : function(){return( (false) )}},
            jquery_selectbox        :   {url : '/libs/jquery/jquery.selectbox-0.2.min.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_selectbox_css    :   {url : '/jquery.selectbox.css', state : '', type : 'css', isLoaded : function(){return( (false) )}},
            jquery_modernaizer      :   {url : '/libs/modernizr/modernizr.custom.75580.js', state : '', type : 'js', isLoaded : function(){return( ((window.Modernizr!==undefined)) )}},
            jquery_watermark        :   {url : '/libs/jquery/jquery.watermark.min.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_underscore       :   {url : '/libs/underscore/underscore-min-1.4.2.js', state : '', type : 'js', isLoaded : function(){return( (false) )}, onLoad : function(){ _.templateSettings.variable = "rc"; }},
            jquery_backbone         :   {url : '/libs/backbone/backbone-min-0.9.2.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_outside          :   {url : '/libs/jquery/jquery.ba-outside-events.min.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_alphanumeric     :   {url : '/libs/jquery/jquery.alphanumeric.pack.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_prettyloader     :   {url : '/libs/jquery/jquery.prettyLoader.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_prettyloader_css :   {url : '/prettyLoader.css', state : '', type : 'css', isLoaded : function(){return( (false) )}},
            jquery_showLoading      :   {url : '/libs/jquery/jquery.showLoading.min.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_showLoading_css  :   {url : '/showLoading.css', state : '', type : 'css', isLoaded : function(){return( (false) )}},
            jquery_printElement     :   {url : '/libs/jquery/jquery.printElement.min.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            jquery_validate         :   {url : '/libs/jquery/jquery.validate.custom.min.js', state : '', type : 'js', isLoaded : function(){return( (false) )}},
            utility_bar             :   {url : '/libs/utility-bar.js', state : '', type : 'js', isLoaded : function(){return( (false) )}}
        }
    };
    this.callbacks = {};
    this.userNavigationMenu = {
        ready : false, // SET TO FALSE IF THERE ARE ANY REQUIRED RESOURCES FOR THIS MODULE. WILL BE SET TO TRUE WHEN IT'S READY FOR USE.
        resources : [THIS.get('resources').jquery_selectbox, THIS.get('resources').jquery_selectbox_css],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        get : function(params){
            if(this.ready){
                THIS.services.debugMessage({method_name : 'core.userNavigationMenu.get', message : 'Resources already loaded. Loading menu.'});
                params.container.html(THIS.userNavigationMenu.getMenu(params));
                THIS.userNavigationMenu.setPlugin();
            }else{
                THIS.resources.load({resources_arr : this.resources, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.userNavigationMenu.get', message : 'Resources loaded. Loading menu.'});
                    params.container.html(THIS.userNavigationMenu.getMenu(params));
                    THIS.userNavigationMenu.setPlugin();
                    THIS.userNavigationMenu.ready = true;
                }});
            }
        },
        setPlugin : function(){
            // ON MANAGE THIS CLASS BUTTON CLICK
            $j("#user_actions_select").on("change", THIS.userNavigationMenu.navigate);
            $j("#user_actions_select").selectbox({
                onOpen: function(inst){
                    $j("#sbOptions_"+inst.uid+" li:first-child").hide();
                    $j("#sbHolder_"+inst.uid).css('border-radius', '4px 4px 0px 0px');
                },
                onClose: function(inst){
                    $j("#sbHolder_"+inst.uid).css('border-radius', '4px 4px 4px 4px');
                }
            });
        },
        navigate : function(){
            if( !$j("#user_actions_select :selected").hasClass('disabled_select_option') ){
                switch($j("#user_actions_select :selected").val())
                {
                case 'my-brainpop-student':
                    window.location = THIS.fetch.path('student-view', {});
                    break;
                case 'settings-student':
                    window.location = THIS.fetch.path('student-settings', {});
                    break;
                case 'logout-student':
                    window.location = "/core/services/logout.weml?mode="+THIS.get('coreObj').settings.user_info.user_type;
                    break;
                case 'my-classes':
                    window.location = THIS.fetch.path('teacher-classes', {});
                    break;
                case 'my-quizzes':
                    window.location = THIS.fetch.path('teacher-quizzes', {});
                    break;
                case 'settings-teacher':
                    window.location = THIS.fetch.path('teacher-settings', {});
                    break;
                case 'logout':
                    window.location = THIS.fetch.path('logout', {context : THIS.get('coreObj').settings.context});
                    break;
                case 'link_to_bp_account':
                    window.location = THIS.fetch.path('link-bp-account', {aid : THIS.user.id()});
                    break;
                case 'are_you_an_educator':
                    UtilityBar.toggle.panelByName({panel_name : 'offer_educator'});
                    THIS.userNavigationMenu.selectUserNameOption();
                    break;
                default:
                  // DO NOTHING
                }
            }
        },
        selectUserNameOption : function(params){
            $('a[href="#user_message"]').trigger('click');
        },
        getMenu : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: false,
                data : {
                    'user_type' : params.user_type,
                    'context' : params.context,
                    'subscription' : params.subscription,
                    'parent_subscription' : params.parent_subscription,
                    'loggedIn' : params.loggedIn,
                    'verified' : params.verified,
                    'username' : params.username
                },
                url: "/core/services/get_user_menu.php",
                dataType: "html",
                cache: false,
                success: function(data) {
                    ajax_res = data;
                }
            });
            return(ajax_res);
        }
    };
    this.fetch = {
        path : function(module, params){
            var response = "";
            var params_str = '', params_sep = '';
            jQuery.each(params, function(i, val) {
                params_str = params_str + params_sep + i + '=' + val;
                params_sep = '&';
            });
            if(params_str!='')
                params_str = '?' + params_str;
            switch(module)
            {
                case 'activity-view':
                    response = response + "/my-brainpop/activity-view/";
                    break;
                case 'student-settings':
                    response = response + "/my-brainpop/student-settings/";
                    break;
                case 'student-view':
                    response = response + "/my-brainpop/student-view/";
                    break;
                case 'student-join':
                    response = response + "/my-brainpop/student-join/";
                    break;
                case 'teacher-view':
                    response = response + "/my-brainpop/teacher-view/";
                    break;
                case 'my-brainpop-help':
                    response = response + "/educators/community/faq/my-brainpop/";
                    break;
                case 'teacher-classes':
                    response = response + "/educators/community/my-classes/";
                    break;
                case 'teacher-quizzes':
                    response = response + "/educators/community/my-quizzes/";
                    break;
                case 'teacher-settings':
                    response = response + "/my-brainpop/teacher-settings/";
                    break;
                case 'link-bp-account':
                    //core.persistentData.set({'bp_link_account_id' : core.user.id() });
                    response = response + "/educators/registration/";
                    break;
                case 'register-educator':
                    response = response + "/educators/registration/";
                    break;
                case 'educators':
                    response = response + "/educators/";
                    break;
                case 'what-is-mybp':
                    response = response + "/educators/community/my-classes/";
                    break;
                case 'logout':
                    response = response + "/core/services/logout.weml";
                    break;
                case 'password-reminder':
                    response = response + '/support/password-reminder/';
                    break;
            }
            return( response+params_str );
        },
        settings : function(){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: false,
                url: "/core/services/get_settings.php",
                dataType: "json",
                cache: false,
                success: function(data) {
                    ajax_res = data;
                }
            });
            return(ajax_res);
        },
        quiz : function(params){
            if(params.quiz_id !='' && params.quiz_id !==undefined){
                $j.ajax({
                    type: "GET",
                    async: false,
                    url: "/code-base/mixer/v2/api/Quizzes/View/"+params.quiz_id,
                    data: {},
                    dataType: "json",
                    success: function(json) {
                        THIS.set('current_quiz', json);
                        if(params.onSuccess !== undefined){
                            params.onSuccess(json);
                        }
                    },
                    error : function(jqXHR, textStatus, errorThrown){
                        if(params.onfailure !== undefined){
                            params.onfailure(jqXHR, textStatus, errorThrown);
                        }
                    }
                });
            }
        }
    };
    this.launch = {
        messageDialog : function(params){}
    };
    this.dialogs = {
        resources : [THIS.get('resources').jquery_blockui, THIS.get('resources').jquery_blockui_css],
        ready : false,
        temp_context : '',
        init : function(params){
            if(!THIS.dialogs.ready){
                THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.dialogs.init', message : 'Dialog Resources loaded.'});
                    THIS.dialogs.ready = true;
                    THIS.dialogs.temp_context = THIS.translations.context;
                    THIS.translations.init({
                        force : true,
                        translation_file : '/core/resources/'+THIS.get('coreObj').settings.language+'/translations/translations.php',
                        version : THIS.get('coreObj').settings.version,
                        context : 'core',
                        onComplete : function(){
                            if(params.onComplete!==undefined){
                                params.onComplete(params);
                            }
                        }
                    });
                }});
            }
        },
        upload_image : function(params){
            if(THIS.dialogs.ready){
                $j('body').css('cursor', 'default');
                var templates_path = THIS.templateManager.templates_path;
                THIS.templateManager.templates_path = '/core/templates/';
                THIS.templateManager.get('upload-image', function(template, params){
                    var templatec = _.template($j( template ).html());  // COMPILE TEMPLATE

                    // PREPARE DIALOG DYNAMIC DATA.
                    var templateData = {
                        upload_image : THIS.translations.get("upload_image"),
                        cancel_upper : THIS.translations.get("cancel_upper")
                    };

                    // OPEN DIALOG
                    $j.blockUI({
                        message: templatec(templateData),
                        css: THIS.services.blockUIDialogCSS({'width' : '330px'})
                    });
                    
                    // ON CANCEL
                    $j('#cancel_image_upload').on('click', function(event) {
                        THIS.translations.context = THIS.dialogs.temp_context;
                        $j.unblockUI();
                        event.preventDefault();
                    });
                    
                    // DEFINE THE ON CHANGE EVENT FOR THE HIDDEN UPLOAD ELEMENT AND TRIGGER THE DIALOG OPENEING
                    $j('#imagefile').on('change', function(event) {
                        $j('body').css('cursor', 'progress');
                        $j('#frm_upload').submit();  // UPLOAD FILE
                    });

                    $j('iframe#upload_target').on('load', function() {
                        var upload_response = $j("#upload_target").contents().find("html").html().replace('<html>', '').replace('</html>', '').replace('<body>', '').replace('</body>', '').replace('<head>', '').replace('</head>', '').replace('</HEAD>', '').replace('<HEAD>', '').replace('<BODY>', '').replace('</BODY>', '').replace('</HTML>', '').replace('<HTML>', '');
                        upload_response = jQuery.parseJSON(upload_response);
                        if(params.onSuccess!==undefined){
                            params.onSuccess(upload_response);
                            THIS.translations.context = THIS.dialogs.temp_context;
                            $j.unblockUI();
                        }
                    });

                }, params);
                THIS.templateManager.templates_path = templates_path;
            }else{
                THIS.dialogs.init({
                    onComplete : function(){
                        THIS.dialogs.upload_image(params);
                    }
                });
            }
        }
    };
    this.resources = {
        loaded : function(resources_arr){
            // RETURNS TRUE IF ALL RESOURCES IN THE SPECIFIED ARRAY ARE LOADED AND FALSE IF THEY ARE NOT.
            var loaded_scripts = 0;
            $j.each(resources_arr, function(index, resource_entry) {
                if(resource_entry.state == 'loaded'){
                    loaded_scripts++;
                }
            });
            return (loaded_scripts==resources_arr.length);
        },
        load : function(params){
            // LOADS AN ARRAY OF RESOURCES.
            if(THIS.resources.loaded(params.resources_arr)){
                params.onLoadComplete();
            }else{
                $j.each(params.resources_arr, function(index, resource_entry) {
                    if(resource_entry.isLoaded()){
                        resource_entry.state = 'loaded';
                        if(resource_entry.type=='js'){
                            THIS.services.debugMessage({method_name : 'core.resources.load', message : 'Already loaded: ' + THIS.get('coreObj').settings.paths.js_path + resource_entry.url});
                        }else{
                            THIS.services.debugMessage({method_name : 'core.resources.load', message : 'Already loaded: ' + THIS.get('coreObj').settings.paths.css_path + resource_entry.url});
                        }
                        if(THIS.resources.loaded(params.resources_arr)){
                            if( resource_entry.onLoad!==undefined ){
                                resource_entry.onLoad();
                            }
                            params.onLoadComplete();
                        }
                    }
                    if(resource_entry.state!='loaded' && resource_entry.state!='loading'){
                        resource_entry.state = 'loading';
                        if(resource_entry.type=='js'){
                            THIS.resources.getScript(THIS.get('coreObj').settings.paths.js_path + resource_entry.url, params.load_params).done( function(){
                                resource_entry.state = 'loaded';
                                THIS.services.debugMessage({method_name : 'core.resources.load', message : 'Successfully loaded: ' + THIS.get('coreObj').settings.paths.js_path + resource_entry.url});
                                if(THIS.resources.loaded(params.resources_arr)){
                                    if( resource_entry.onLoad!==undefined ){
                                        resource_entry.onLoad();
                                    }
                                    params.onLoadComplete();
                                }
                            }).fail( function(){
                                THIS.services.debugMessage({method_name : 'core.resources.load', message : 'Failed to load: ' + THIS.get('coreObj').settings.paths.css_path + resource_entry.url});
                            });
                        }else if(resource_entry.type=='css'){
                            if (document.createStyleSheet){
                                document.createStyleSheet(THIS.get('coreObj').settings.paths.css_path + resource_entry.url);
                            }else{
                                $j("head").append("<link rel='stylesheet' type='text/css' href='"+THIS.get('coreObj').settings.paths.css_path + resource_entry.url + "' />");
                            }
                            resource_entry.state = 'loaded';
                            THIS.services.debugMessage({method_name : 'core.resources.load', message : 'Successfully loaded: ' + THIS.get('coreObj').settings.paths.css_path + resource_entry.url});
                            if(THIS.resources.loaded(params.resources_arr)){
                                if( resource_entry.onLoad!==undefined ){
                                    resource_entry.onLoad();
                                }
                                params.onLoadComplete();
                            }
                        }
                    }
                });
            }
        },
        getScript : function(url, options){
            options = $j.extend(options || {}, {
                dataType: "script",
                cache: true,
                url: url
            });
            return $j.ajax(options);
        }
    };
    this.define = {
        events : function(){
            $j(document).keyup(function(e) {
                // ESC SHOULD CLOSE ANY OPEN DOCUMENT.
                if (e.keyCode == 27) {
                    if($j.datepicker!==undefined)
                        $j(".date_selection_input").datepicker("hide");
                    if($j.unblockUI!==undefined)
                        $j.unblockUI();
                    $j('body').css('cursor', 'default');
                }
            });
        },
        hacks : function(){
            // IE HACK. ADD THE indexof FUNCTION TO THE ARRAY METHODS.
            if (!Array.prototype.indexOf){
                Array.prototype.indexOf = function(elt /*, from*/){
                    var len = this.length >>> 0;
                    var from = Number(arguments[1]) || 0;
                    from = (from < 0)
                         ? Math.ceil(from)
                         : Math.floor(from);
                    if (from < 0)
                      from += len;

                    for (; from < len; from++)
                    {
                      if (from in this &&
                          this[from] === elt)
                        return from;
                    }
                    return -1;
                };
            }
        }
    };
    this.services = {
        formatTime: function(params){
            if(params.epoc!==undefined){
                var myDate = new Date( params.epoc *1000);
                //var date_parts = myDate.toString().split(' ');
                var date_parts = myDate.toDateString().split(" ");
                date_parts.push((myDate.getHours()>9?myDate.getHours():"0"+myDate.getHours()) +":"+ (myDate.getMinutes()>9?myDate.getMinutes():"0"+myDate.getMinutes() )+":"+ (myDate.getSeconds()>9?myDate.getSeconds():"0"+myDate.getSeconds()));
                
                var time_parts = date_parts[4].split(':');

                var day_part = 'am', hour = myDate.getHours();
                if(myDate.getHours()>12){ 
                    day_part = 'pm';
                    hour = hour - 12;
                }else if(hour==12){
                    day_part = 'pm';
                }

                switch(params.output)
                {
                case 'time':
                    return ( hour + ':' + time_parts[1] + '<span class="day_part">' + day_part + '</span>' );
                    break;
                case 'date':
                    return ( date_parts[1] + ' ' + date_parts[2] + ', ' + date_parts[3] );
                    break;
                case 'date_bull_hour':
                default:
                    return ( date_parts[1] + ' ' + date_parts[2] + ', ' + date_parts[3] + '&nbsp;·&nbsp;' + hour + ':' + time_parts[1] + '<span class="day_part">' + day_part + '</span>');
                }
            }else{
                return ('invalid');
            }
        },
        getEpocTime: function(params){
            if(params.date!=''){
                var myDate = new Date(params.date);
                return((myDate.getTime()/1000));
            }
            return(params.date);
        },
        replaceAll : function(txt, replace, with_this){
            return txt.replace(new RegExp(replace, 'g'),with_this);
        },
        blockUIDialogCSS : function(params){
            var obj = {
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                'border-radius' : '10px',
                'width': params.width,
                'min-width': params.min_width,
                'height': 'auto',
                'centerY': 'true',
                'centerX': 'true',
                'border': '0px solid black'
            };
            return (obj);
        },
        blockUIGrowl : function(params){
            //var top = window_obj.scrollTop();
            var window_obj = $(window);
            if(window.parent.document.getElementById('my-quizzes-iframe')!==undefined && window.parent.document.getElementById('my-quizzes-iframe')!==null){
                window_obj = $(parent.window);
            }
            var top = window_obj.scrollTop();
            $.blockUI({ 
                message: $('<div class="growlUI"><h1>'+params.caption+'</h1><h2>'+params.message+'</h2></div>'), 
                fadeIn: 700, 
                fadeOut: 700, 
                timeout: 2000, 
                showOverlay: false, 
                centerY: false, 
                css: { 
                    width: '350px', 
                    top: (top + 10) + 'px', 
                    left: '', 
                    right: '10px', 
                    border: 'none', 
                    padding: '5px', 
                    backgroundColor: '#000', 
                    '-webkit-border-radius': '10px', 
                    '-moz-border-radius': '10px', 
                    opacity: .6, 
                    color: '#fff' 
                } 
            });
        },
        getNumberSuffix : function(num){
            var d = String(num);
            return d.substr(-(Math.min(d.length, 2))) > 3 && d.substr(-(Math.min(d.length, 2))) < 21 ? "th" : ["th", "st", "nd", "rd", "th"][Math.min(Number(d)%10, 4)];
        },
        growlNotification : function(caption, message){
            var resources = [THIS.get('resources').jquery_blockui, THIS.get('resources').jquery_blockui_css];
            if(THIS.resources.loaded(resources)){
                $j.growlUI(caption, message);
            }else{
                THIS.resources.load({resources_arr : resources, load_params : {async: false}, onLoadComplete : function(){
                    $j.growlUI(caption, message);
                }});
            }
        },
        notify : function(params){
            switch( THIS.get('notifications_type') )
            {
                case 'growl':
                    THIS.services.growlNotification(params.caption, params.message);
                    break;
                case 'message':
                    THIS.launch.messageDialog({message : params.message});
                    break;
            }
        },
        debugMessage : function(params){
            if ($j.browser.msie) {
                //alert( "IE Console not supported" );
            }else if(THIS.get('coreObj').settings.server=='dev' || params.type=='error' || THIS.get('coreObj').settings.debug){
                var method_name = (THIS.services.defined(params.method_name))?params.method_name:'';
                var state = (THIS.services.defined(params.state))?'state ===> '+params.state:'';
                var myDate = new Date();
                var log_title_sep_length = 60, log_title_base = method_name + ' ' + state + ' [' + myDate.getTime() + '  ::::  ' + myDate.toLocaleString()  + '] ';
                
                window.console && console.log('\n\n======= START ' + log_title_base + Array(log_title_sep_length).join("="));
                if(THIS.services.defined(params.title)){
                    window.console && console.log(params.title);
                }
                if(THIS.services.defined(params.message)){
                    window.console && console.log(params.message);
                }
                var counter = 0;
                if(params.objects !== undefined){
                    jQuery.each(params.objects, function(key, value) {
                        window.console && console.log('');
                        window.console && console.log((counter+1) + '. '+ key + ' ==> ');
                        window.console && console.log(value);
                        counter++;
                    });
                }
                window.console && console.log('\n======= END ' + log_title_base + Array(log_title_sep_length+2).join("="));
            }
        },
        defined : function(x){
            return typeof x != 'undefined';
        },
        getURLParam : function(name){
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.search);
            if(results == null)
                return "";
            else
                return decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        generateUID : function(params){
            var delim = "-";
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());        
        },
        validateEmail : function(email){
            var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
            if( !emailReg.test( email ) ) {
                return false;
            } else {
                return true;
            }
        }
    };
    this.persistentData = {
        ready : false,
        resources : [THIS.get('resources').jquery_modernaizer, THIS.get('resources').jquery_cookie, THIS.get('resources').jquery_json, THIS.get('resources').jquery_base64],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        init : function(onComplete){
            if(!THIS.persistentData.ready){
                THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.persistentData.init', message : 'Resources loaded. getting/settings data.'});
                    THIS.persistentData.ready = true;
                    onComplete();
                }});
            }
        },
        set : function(params){
            if(THIS.persistentData.ready){
                $j.each( params, function(key, value) {
                    var personalized_key = THIS.user.username()+'_'+key;
                    if(Modernizr.localstorage){
                        // SAVE PARAMS IN LOCAL STORAGE
                        localStorage.setItem(personalized_key, value);
                    }else{
                        // SAVE PARAMS IN COOKIE
                        var per_cookie = $j.cookie(THIS.get('persistent_data_cookie'));
                        if(per_cookie!='' && per_cookie!==null && per_cookie!==undefined){
                            var pers_params = jQuery.parseJSON( $j.base64.decode(per_cookie) );  // READ THE CURRENT PERSISTENT DATA COOKIE
                        }else{
                            var pers_params = {};  // CREATE A NEW JSON FOR HOLDING THE PARAMS
                        }
                        pers_params[personalized_key] = value;
                        $j.cookie(THIS.get('persistent_data_cookie'), $j.base64.encode(JSON.stringify(pers_params)), {path: ''});  // RESAVE THE COOKIE
                    }
                });
            }else{
                THIS.persistentData.init(function(){
                    THIS.persistentData.set(params);
                });
            }
        },
        get : function(key){
            var ret_val = '';
            var personalized_key = THIS.user.username()+'_'+key;
            if(THIS.persistentData.ready){
                if(Modernizr.localstorage){
                    ret_val = localStorage.getItem(personalized_key);  // RETURN VALUE FROM LOCAL STORAGE
                }else{
                    var per_cookie = $j.cookie(THIS.get('persistent_data_cookie'));
                    if(per_cookie!='' && per_cookie!==null && per_cookie!==undefined){
                        var pers_params = jQuery.parseJSON( $j.base64.decode(per_cookie) );  // READ THE CURRENT PERSISTENT DATA COOKIE
                        ret_val = pers_params[personalized_key];
                    }else{
                        ret_val = '';
                    }
                }
            }else{
                THIS.persistentData.init(function(){
                    ret_val = THIS.persistentData.get(key);
                })
            }
            return(ret_val);
        }
    };
    this.watermark = {
        ready : false,
        resources : [THIS.get('resources').jquery_watermark],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        init : function(onComplete){
            if(!THIS.watermark.ready){
                THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.watermark.init', message : 'Resources loaded. Watermark.'});
                    THIS.watermark.ready = true;
                    onComplete();
                }});
            }
        },
        set : function(params){
            if(THIS.watermark.ready){
                $j.each( params.inputs_arr, function(index, value) {
                    $j(value.obj).watermark(value.text);
                });
            }else{
                THIS.watermark.init(function(){
                    THIS.watermark.set(params);
                });
            }
        }
    };
    this.user = {
        loggedIn : function(){
            return( (THIS.get('coreObj').settings.user_info.logged_in=='false')?false:true );
        },
        userType : function(){
            return( THIS.get('coreObj').settings.user_info.user_type );
        },
        first_name : function(){
            return( THIS.get('coreObj').settings.user_info.first_name );
        },
        last_name : function(){
            return( THIS.get('coreObj').settings.user_info.last_name );
        },
        username : function(){
            return( THIS.get('coreObj').settings.user_info.username );
        },
        verified : function(){
            return( (THIS.get('coreObj').settings.user_info.verified=='false')?false:true );
        },
        id : function(){
            return( THIS.get('coreObj').settings.user_info.id );
        },
        subscription_level : function(){
            return( THIS.get('coreObj').settings.user_info.subscription_level );
        },
        parent_subscription_level : function(){
            return( THIS.get('coreObj').settings.user_info.parent_subscription_level );
        },
        permissions : function(){
            return( THIS.get('coreObj').settings.user_info.permissions );
        },
        educator : function(){
            return( (THIS.get('coreObj').settings.user_info.educator=='false')?false:true );
        },
        parent_status : function(){
            return( THIS.get('coreObj').settings.user_info.parent_status );
        }
    },
    this.accounts = {
        verifyTeacherCode : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: params.async,
                url: "/core/services/verify_teacher_code.php",
                dataType: "json",
                data : {
                    school_code : params.school_code,
                    EntryID : params.EntryID
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        createEducatorsAccount : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/create_educators_account.php",
                dataType: "json",
                data : {
                    username : params.username,
                    password : params.password,
                    email : params.email,
                    first_name : params.first_name,
                    last_name : params.last_name,
                    country: params.country,
                    zipcode : params.zipcode,
                    school : params.school,
                    school_name : params.school_name,
                    t : params.t
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        sendActivationEmail : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/send_activation_email.php",
                dataType: "json",
                data : {
                    language : params.language,
                    EntryID : params.EntryID,
                    t : params.t
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        sendAccountContactUpdateEmail : function(params){
            var ajax_res = '';
            console.log(params);
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/send_account_contact_update_email.php",
                dataType: "json",
                data : {
                    EntryID : params.id,
                    t : params.t,
                    contact : params.contact
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        sendCodeRequest : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/send_code_request.php",
                dataType: "json",
                data : {
                    id : params.EntryID,
                    t : params.t,
                    message : params.message,
                    language : params.language
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        confirmAccountLogin : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: params.async,
                url: "/core/services/confirm_login.php",
                dataType: "json",
                data : {
                    language : params.language,
                    username : params.username,
                    password : params.password,
                    context : params.context
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        confirmAccountIdAndLogin : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: params.async,
                url: "/core/services/confirm_account_id_and_login.php",
                dataType: "json",
                data : {
                    language : params.language,
                    username : params.username,
                    password : params.password,
                    account_id : params.account_id,
                    context : params.context
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        updateAccountContact : function(params){
            console.log(params);
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/update_account_contact.php",
                dataType: "json",
                data : {
                    first_name : params.first_name,
                    last_name : params.last_name,
                    title : params.title,
                    email : params.email,
                    account_id : params.account_id,
                    username : params.username,
                    password : params.password,
                    language : params.language,
                    t : params.t
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        linkEducatorsAccount : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/link_educators_account.php",
                dataType: "json",
                data : {
                    EntryID : params.EntryID,
                    username : params.username,
                    password : params.password,
                    language : params.language
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        linkSchoolAccount : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/link_school_account.php",
                dataType: "json",
                data : {
                    EntryID : params.EntryID,
                    t : params.t,
                    language : params.language,
                    username : params.username,
                    password : params.password,
                    school_code : params.school_code
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        activateAccount : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/activate_account.php",
                dataType: "json",
                data : {
                    id : params.EntryID
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        getAccountName : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: params.async,
                url: "/core/services/get_account_name.php",
                dataType: "json",
                data : {
                    id : params.id
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        logout : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "POST",
                async: params.async,
                url: "/core/services/logout.php",
                dataType: "json",
                data : {},
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(data.cookies_to_clear!==undefined){
                            THIS.resources.load({resources_arr : [THIS.get('resources').jquery_cookie], load_params : {async: false}, onLoadComplete : function(){
                                $j.each(data.cookies_to_clear, function(index, value) {
                                    $j.cookie(value, '', {path : '/', domain : 'a16yearbrainpopfan.github.io'});
                                });
                            }});
                        }
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(params.onFailure!==undefined){
                        params.onFailure();
                    }
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        }
    };
    this.restrict = {
        ready : false,
        resources : [THIS.get('resources').jquery_alphanumeric],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        init : function(onComplete){
            if(!THIS.restrict.ready){
                /*THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.restrict.init', message : 'Resources loaded.'});
                    THIS.restrict.ready = true;
                    onComplete();
                }});*/
                THIS.restrict.ready = true;
                onComplete();
            }
        },
        defineInputEvents : function(params){
            $j(params.obj).on('keypress', function (event) {  // BIND A KEY PRESS EVENT TO THE OBJECT
                if (event.keyCode == 13 || event.keyCode == 8 || event.keyCode == 9) { // DO NOTHING IF A ENTER, TAB OR BACKSPACE HAD BEEN TYPED
                    return true;
                }else{
                    var regex = new RegExp(params.allowed_characters);
                    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
                    if (!regex.test(key)) {
                        event.preventDefault();  // INPUT NOT ALLOWED, PREVENT DEFAULT INPUT BEHAVIOR.
                        if(params.onFailure!==undefined){
                            params.onFailure(key);  // EXECUTE THE ON FAILURE FUNCTION IF PRESENT
                        }
                        return false;
                    }else{
                        // ALLOWED
                        return true;
                    }
                }
            }).on('paste', function (event) {  // BIND A PASTE EVENT TO THE OBJECT
                var obj = this;
                setTimeout( function() {  // THE PASTE INPUT IS NOT AVAILABLE FOR US AT THE TIME OF PASTING. WE NEED TO PAUSE FOR A BRIEF MOMENT AND WAIT FOR IT.
                    var input_text = $j(obj).val();
                    $j(obj).val(''); // CLEAN THE CURRENT INPUT FIELD
                    for (var i = 0; i < input_text.length; i++){
                        var regex = new RegExp(params.allowed_characters);
                        var key = input_text.charAt(i);
                        if (!regex.test(key)) {
                            // INPUT NOT ALLOWED, PREVENT DEFAULT INPUT BEHAVIOR.
                            if(params.onFailure!==undefined){
                                params.onFailure(key);  // EXECUTE THE ON FAILURE FUNCTION IF PRESENT
                            }
                        }else{
                            // INPUT ALLOWED, ADD IT TO THE INPUT.
                            $j(obj).val( $j(obj).val() + input_text.charAt(i) );
                        }
                    }
                }, 100);
            });
        },
        password : function(obj, onFailure){
            var allowed_characters = '^[a-zA-Z0-9._\\-@]+$';
            if(THIS.restrict.ready){
                THIS.restrict.defineInputEvents({obj : obj, allowed_characters : allowed_characters, onFailure : onFailure});
            }else{
                THIS.restrict.init(function(){
                    THIS.restrict.password(obj, onFailure);
                });
            }
        },
        username : function(obj, onFailure){
            var allowed_characters = '^[a-zA-Z0-9._\\-@]+$';
            if(THIS.restrict.ready){
                THIS.restrict.defineInputEvents({obj : obj, allowed_characters : allowed_characters, onFailure : onFailure});
            }else{
                THIS.restrict.init(function(){
                    THIS.restrict.username(obj, onFailure);
                });
            }
        },
        class_code : function(obj, onFailure){
            var allowed_characters = '^[a-zA-Z0-9._]+$';
            if(THIS.restrict.ready){
                THIS.restrict.defineInputEvents({obj : obj, allowed_characters : allowed_characters, onFailure : onFailure});
            }else{
                THIS.restrict.init(function(){
                    THIS.restrict.class_code(obj, onFailure);
                });
            }
        },
        quiz_code : function(obj, onFailure){
            var allowed_characters = '^[a-zA-Z0-9._]+$';
            if(THIS.restrict.ready){
                THIS.restrict.defineInputEvents({obj : obj, allowed_characters : allowed_characters, onFailure : onFailure});
            }else{
                THIS.restrict.init(function(){
                    THIS.restrict.quiz_code(obj, onFailure);
                });
            }
        },
        zip_code : function(obj, onFailure){
            var allowed_characters = '^[0-9]+$';
            if(THIS.restrict.ready){
                THIS.restrict.defineInputEvents({obj : obj, allowed_characters : allowed_characters, onFailure : onFailure});
            }else{
                THIS.restrict.init(function(){
                    THIS.restrict.zip_code(obj, onFailure);
                });
            }
        },
        email : function(obj, onFailure){
            var allowed_characters = '^[a-zA-Z0-9._\\-@]+$';
            if(THIS.restrict.ready){
                THIS.restrict.defineInputEvents({obj : obj, allowed_characters : allowed_characters, onFailure : onFailure});
            }else{
                THIS.restrict.init(function(){
                    THIS.restrict.email(obj, onFailure);
                });
            }
        }
    }
    this.templateManager = {
        ready : false,
        templates_path : '',
        resources : [THIS.get('resources').jquery_modernaizer],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        templates: {},
        init : function(params){
            if(!THIS.templateManager.ready){
                if(THIS.templateManager.templates_path==''||THIS.templateManager.templates_path===undefined){
                    THIS.services.debugMessage({method_name : 'core.templateManager.init', message : 'Init failed. Missing templates path'});
                }else{
                    THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                        THIS.services.debugMessage({method_name : 'core.templateManager.init', message : 'Resources loaded.'});
                        THIS.templateManager.ready = true;
                        params.onComplete();
                    }});
                }
            }
        },
        get: function(id, callback, params){
            if(THIS.templateManager.ready){
                if (Modernizr.localstorage && THIS.get('coreObj').settings.debug!='true'){ // LOCAL STORAGE SUPPORT
                    
                    /*localStorage.getItem('templates_version')
                    localStorage.getItem('previous_templates_version')
                    
                    var tmpl= localStorage.getItem(id + '_' + THIS.get('coreObj').settings.version);
                    
                    // MANAGE VERSIONING
                    if(localStorage.getItem('version') == THIS.get('coreObj').settings.version){
                        //console.log('core version match: old['+localStorage.getItem('version')+'], new['+THIS.get('coreObj').settings.version+']')
                    }else{
                        //console.log('core version mismatch: old['+localStorage.getItem('version')+'], new['+THIS.get('coreObj').settings.version+']')
                    }*/

                    var async = true;
                    if(params!==undefined){
                        if(params.async!==undefined){
                            async = params.async;
                        }
                    }

                    var tmpl= localStorage.getItem(id);
                    if(tmpl==null){
                        // IF TEMPLATE NOT IN LOCAL STORAGE, ADD IT, AND EXECUTE THE CALLBACK
                        $j.ajax({
                            url : THIS.templateManager.templates_path + id + ".html",
                            async : async,
                            success : function(template){
                                localStorage.setItem(id, template);
                                callback(template, params);
                            }
                        });
                        /*$j.get(THIS.templateManager.templates_path + id + ".html", function(template){
                            localStorage.setItem(id, template);
                            callback(template, params);
                        });*/
                    }else{
                        callback(tmpl, params);  // TEMPLATE EXISTS IN THE LOCAL STORAGE, JUST EXECUTE
                    }
                }else{  // LOCAL STORAGE NOT SUPPORTED, MAINTAIN LOCAL CACHE
                    var template = THIS.templateManager.templates[id];
                    if (template) {
                        callback(template, params);
                    } else {
                        var that = this;
                        $j.get(THIS.templateManager.templates_path + id + ".html", function(template){
                            var $jtmpl = $j(template);
                            THIS.templateManager.templates[id] = $jtmpl;
                            callback($jtmpl, params);
                        });
                    }
                }
            }else{
                THIS.templateManager.init({'onComplete' : function(){
                    THIS.templateManager.get(id, callback, params);
                }});
            }
        }
    };
    this.translations = {
        ready : false,
        context : '',
        resources : [THIS.get('resources').jquery_modernaizer],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        init : function(params){
            if(!THIS.translations.ready || params.force){
                THIS.translations.context = params.context;
                THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.translations.init', message : 'Resources loaded.'});
                    THIS.translations.load({
                        translation_file_path : params.translation_file,
                        translation_file_version : params.version,
                        context : params.context
                    });
                    THIS.translations.ready = true;
                    if(params.onComplete!==undefined){
                        params.onComplete();
                    }
                }});
            }
        },
        get : function(key){
            if(THIS.translations.ready){
                if(Modernizr.localstorage && localStorage.getItem(THIS.translations.context+'_data_loaded')=='true'){
                    return(  localStorage.getItem(THIS.translations.context + '_' +key) );
                }else{
                    return( eval('THIS.get("coreObj").settings.localization.dictionary.'+THIS.translations.context + '_' +key) );
                }
            }else{
                THIS.translations.init({'onComplete' : function(){
                    return(THIS.translations.get(THIS.translations.context + '_' +key));
                }});
            }
        },
        load : function(params){
            if ( Modernizr.localstorage && params.force_reload!=true && THIS.get('coreObj').settings.debug!='true' && localStorage.getItem(THIS.translations.context+'_data_loaded')!==null && localStorage.getItem(THIS.translations.context+'_data_loaded')!==undefined && params.translation_file_version==localStorage.getItem(THIS.translations.context+'_version') ){
                $j.extend(THIS.get('coreObj').settings, {'localization' : {'source' : 'local_storage', 'loaded' : false}});
            }else{
                // LOAD LOCALIZATION
                $j.ajax({
                    type: "GET",
                    async: false,
                    url: params.translation_file_path,
                    data : {'output' : 'json'},
                    dataType: "json",
                    success: function(json) {                    
                        if (Modernizr.localstorage){
                            for(var key in json){
                                localStorage.setItem(THIS.translations.context + '_' + key, json[key]);
                            }
                            localStorage.setItem(THIS.translations.context+'_data_loaded', 'true');
                            localStorage.setItem(THIS.translations.context+'_version', params.translation_file_version);
                            //localStorage.setItem('version', THIS.get('coreObj').settings.version);
                            $j.extend(THIS.get('coreObj').settings, {'localization' : {'dictionary' : {}, 'source' : 'local_storage', 'loaded' : true}});
                        }else{
                            $j.extend(THIS.get('coreObj').settings, {'localization' : {'dictionary' : json, 'source' : 'dictionary'}});
                        }
                    }
                });
            }
        }
    };
    this.prettyLoader = {
        ready : false,
        resources : [THIS.get('resources').jquery_prettyloader, THIS.get('resources').jquery_prettyloader_css],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        init : function(params){
            if(!THIS.prettyLoader.ready){
                THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.prettyLoader.init', message : 'Resources loaded. showing/hiding.'});
                    THIS.prettyLoader.ready = true;
                    $j.prettyLoader();
                    params.onComplete();
                }});
            }
        },
        load : function(str){
            if(THIS.prettyLoader.ready){
                $j.prettyLoader.show(str, 2000);
            }else{
                THIS.prettyLoader.init({'onComplete' : function(){
                    THIS.prettyLoader.load();
                }});
            }
        },
        hide : function(){
            $j.prettyLoader.hide();
        }
    };
    this.autoComplete = {
        ready : false,
        resources : [THIS.get('resources').jquery_autocomplete],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        custom_resources : [THIS.get('resources').jquery_autocomplete],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        init : function(params){
            if(!THIS.autoComplete.ready){
                THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.autoComplete.init', message : 'Resources loaded. autoComplete.'});
                    THIS.autoComplete.ready = true;
                    if(params.onComplete!==undefined){
                        params.onComplete();
                    }
                }});
            }
        },
        topic_names : function(obj, options){
            if(THIS.autoComplete.ready){
                $j.ajax({
                    url: "/movie_names.txt",
                    //async: false,
                    success: function(html){
                        html = THIS.services.replaceAll(html, "&#39;", "'");
                        $j(obj).autocomplete(html.split("^"), options);
                    }
                });
            }else{
                THIS.autoComplete.init({'onComplete' : function(){
                    THIS.autoComplete.topic_names(obj, options);
                }});
            }
        },
        game_names : function(obj, options){
            if(THIS.autoComplete.ready){
                $j.ajax({
                    url: "/game_names.txt",
                    //async: false,
                    success: function(html){
                        $j(obj).autocomplete(html.split("^"), options);
                    }
                });
            }else{
                THIS.autoComplete.init({'onComplete' : function(){
                    THIS.autoComplete.game_names(obj, options);
                }});
            }
        },
        search : function(obj, options){
            if(THIS.autoComplete.ready){
                $j.ajax({
                    url: "/auto_complete.txt",
                    //async: false,
                    success: function(html){
                        $j(obj).autocomplete(html.split("^"), options);
                    }
                });
            }else{
                THIS.autoComplete.init({'onComplete' : function(){
                    THIS.autoComplete.search(obj, options);
                }});
            }
        }
    };
    this.print = {
        ready : false,
        current_quiz : '',
        resources : [THIS.get('resources').jquery_printElement, THIS.get('resources').jquery_underscore],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        init : function(params){
            if(!THIS.print.ready){
                THIS.resources.load({resources_arr : this.resources, load_params : {async: false}, onLoadComplete : function(){
                    THIS.services.debugMessage({method_name : 'core.print.init', message : 'Resources loaded. print.'});
                    THIS.print.ready = true;
                    if(params.onComplete!==undefined){
                        params.onComplete();
                    }
                }});
            }
        },
        domObj : function(obj, options){
            if(THIS.print.ready){
                $j(obj).printElement(options)
            }else{
                THIS.print.init({'onComplete' : function(){
                    THIS.print.domObj(obj, options);
                }});
            }
        },
        quiz : function(params){
            if(THIS.print.ready){
                if(params.quiz_id!==undefined && params.quiz_id!='' ){
                    // PRINT QUIZ BY QUIZ ID. LOAD QUIZ IF NEEDED
                    if( THIS.print.current_quiz=='' || THIS.print.current_quiz.Quiz.EntryID!=params.quiz_id ){
                        THIS.fetch.quiz({
                            quiz_id : params.quiz_id,
                            onSuccess : function(quiz){
                                THIS.print.current_quiz = quiz;
                            }
                        });
                    }
                }else if(params.quiz!==undefined){
                    // PRINT QUIZ BY QUIZ OBJ
                    THIS.print.current_quiz = params.quiz;
                }
                
                if( THIS.print.current_quiz!='' ){
                    // PRINT QUIZ
                    var templates_path = THIS.templateManager.templates_path;
                    THIS.templateManager.templates_path = '/core/templates/';
                    THIS.templateManager.get('quiz/print', function(template, params){
                        var templatec = _.template($j( template ).html());  // COMPILE TEMPLATE

                        // PREPARE DIALOG DYNAMIC DATA.
                        var templateData = {
                            quiz : THIS.print.current_quiz
                        };
                        
                        var printElement = $j('<div></div>');
                        $j(printElement).html(templatec(templateData));
                        $j(printElement).printElement(params.print_options);
                        if( params.onSuccess!==undefined ){
                            params.onSuccess();
                        }
                    }, {
                        print_options : params.print_options,
                        onSuccess : params.onSuccess
                    });
                    THIS.templateManager.templates_path = templates_path;
                }
            }else{
                THIS.print.init({'onComplete' : function(){
                    THIS.print.quiz(params);
                }});
            }
        }
    };
    this.upload = {
        image : function(params){
            if(params.onBegin!==undefined){
                params.onBegin();
            }
            // REMOVE AND RESET ANY PRE EXISTING UPLOAD DOM ELEMENTS AND EVENTS
            $j('#imagefile').off()
            $j('#upload_element, #frm_upload, #imagefile, #upload_target').remove();
            
            // DEFINE AN UPLOAD ELEMENT AND ADD IT TO THE DOM
            if($j.browser.msie || THIS.services.getURLParam('ie')!=''){
                THIS.dialogs.upload_image(params);
            }else{
                var upload_element = $j('<div id="upload_element" style="display: none;"><div style="display: none;"><form id="frm_upload" action="/core/services/image_upload.php" method="post" enctype="multipart/form-data" target="upload_target" ><input type="file" name="imagefile" id="imagefile" size="40"></form></div><iframe id="upload_target" name="upload_target" style="display: none;"></iframe></div>');
                $j('body').append( $j(upload_element).html() );

                // DEFINE THE ON CHANGE EVENT FOR THE HIDDEN UPLOAD ELEMENT AND TRIGGER THE DIALOG OPENEING
                $j('#imagefile').on('change', function(event) {
                    $j('#frm_upload').submit();  // UPLOAD FILE
                }).trigger('click');

                $j('iframe#upload_target').on('load', function() {
                    var upload_response = $j("#upload_target").contents().find("html").html().replace('<html>', '').replace('</html>', '').replace('<body>', '').replace('</body>', '').replace('<head>', '').replace('</head>', '');
                    upload_response = jQuery.parseJSON(upload_response);
                    if(params.onSuccess!==undefined){
                        params.onSuccess(upload_response);
                    }
                });
            }
        },
        imageUndo : function(params){
            if(params.image_id!==undefined && params.image_id!=''){
                $j.ajax({
                    type: "POST",
                    async: false,
                    url: "/core/services/image_upload_undo.php",
                    data : {
                        image_id : params.image_id
                    },
                    dataType: "json",
                    cache: false,
                    success: function(data) {
                        if(params.onSuccess!==undefined){
                            params.onSuccess();
                        }
                    }
                });
            }
        }
    }
    this.utilityBar = {
        ready : false, // SET TO FALSE IF THERE ARE ANY REQUIRED RESOURCES FOR THIS MODULE. WILL BE SET TO TRUE WHEN IT'S READY FOR USE.
        resources : [THIS.get('resources').jquery_underscore, THIS.get('resources').bp_utility_bar, THIS.get('resources').jquery_watermark, THIS.get('resources').jquery_autocomplete_css],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        get : function(params){
            if(this.ready){
                THIS.services.debugMessage({method_name : 'core.utilityBar.get', message : 'Resources already loaded. Loading menu.'});
                THIS.utilityBar.render(params);
            }else{
                THIS.resources.load({resources_arr : this.resources, onLoadComplete : function(){
                    THIS.translations.init({
                        force : true,
                        translation_file : '/core/resources/'+THIS.get('coreObj').settings.language+'/translations/translations.php',
                        version : THIS.get('coreObj').settings.version,
                        context : 'core',
                        onComplete : function(){
                            THIS.services.debugMessage({method_name : 'core.utilityBar.get', message : 'Resources loaded. Loading menu.'});
                            THIS.utilityBar.render(params);
                            THIS.utilityBar.ready = true;
                        }
                    });
                }});
            }
        },
        render : function(params){
            var templates_path_org = THIS.templateManager.templates_path;  // SAVE CURRENT TEMPLATES PATH
            THIS.templateManager.templates_path = '/core/resources/'+THIS.get('coreObj').settings.language+'/templates/';  // SET CURRENT TEMPLATES PATH
            var template_name = 'utility-bar';
            
            THIS.templateManager.get(template_name, function(template, params){
                _.templateSettings.variable = "rc";
                var templatec = _.template($j( template ).html());  // COMPILE TEMPLATE

                // PREPARE DIALOG DYNAMIC DATA.
                var templateData = {
                    are_you_a_student : THIS.translations.get("are_you_a_student"),
                    are_you_an_educator : THIS.translations.get("are_you_an_educator"),
                    bad_code : THIS.translations.get("bad_code"),
                    cancel : THIS.translations.get("cancel_upper"),
                    code_panel_header : THIS.translations.get("code_panel_header"),
                    close : THIS.translations.get("close_upper"),
                    do_not_show_again : THIS.translations.get("do_not_show_again"),
                    educators_upgrade_offer_header : THIS.translations.get("educators_upgrade_offer_header"),
                    educators_upgrade_offer_description : THIS.translations.get("educators_upgrade_offer_description"),
                    code_description : THIS.translations.get("code_description"),
                    go : THIS.translations.get("go"),
                    login : THIS.translations.get("login"),
                    login_header : THIS.translations.get("login_header"),
                    missing_user_name_message : THIS.translations.get("missing_user_name_message"),
                    missing_password_message : THIS.translations.get("missing_password_message"),
                    missing_code_message : THIS.translations.get("missing_code_message"),
                    login_failed_message : THIS.translations.get("login_failed_message"),
                    login_wrong_password_message : THIS.translations.get("login_wrong_password_message"),
                    non_linked_educators_error_message : THIS.translations.get("non_linked_educators_error_message"),
                    logout : THIS.translations.get("logout"),
                    enter_code : THIS.translations.get("enter_code"),
                    non_linked_educator_header : THIS.translations.get("non_linked_educator_header"),
                    non_linked_educator_description : THIS.translations.get("non_linked_educator_description"),
                    no : THIS.translations.get("no"),
                    no_sign_up : THIS.translations.get("no_sign_up"),
                    yes : THIS.translations.get("yes"),
                    yes_log_in : THIS.translations.get("yes_log_in"),
                    later : THIS.translations.get("ask_me_later"),
                    logged_in : THIS.get('coreObj').settings.user_info.logged_in,
                    user_type : ( params.user_type_override!='' )?params.user_type_override:THIS.user.userType(),
                    subscription : ( params.subscription_override!='' )?params.subscription_override:'',
                    take_tour_or_subscribe : THIS.translations.get("take_tour_or_subscribe"),
                    educator_offer_header : THIS.translations.get("educator_offer_header"),
                    educator_offer_description : THIS.translations.get("educator_offer_description"),
                    login_educator_header : THIS.translations.get("login_educator_header"),
                    signup : THIS.translations.get("signup"),
                    educators_link_failed : THIS.translations.get("educators_link_failed"),
                    not_an_educator_account : THIS.translations.get("not_an_educator_account"),
                    educator_link_account_success_message : THIS.translations.get("educator_link_account_success_message"),
                    orphan_student_message : THIS.translations.get("orphan_student_message"),
                    orphan_student_title : THIS.translations.get("orphan_student_title"),
                    my_brainpop_locked : THIS.translations.get("my_brainpop_locked"),
                    mixer_login_message : THIS.translations.get("mixer_login_message"),
                    my_brainpop_login_message : THIS.translations.get("my_brainpop_login_message"),
                    generic_login_message : THIS.translations.get("generic_login_message"),
                    no_student_mixer_access_header : THIS.translations.get("no_student_mixer_access_header"),
                    no_student_mixer_access_description : THIS.translations.get("no_student_mixer_access_description"),
                    link_bp_account_mixer_header : THIS.translations.get("link_bp_account_mixer_header"),
                    link_bp_account_mixer_description : THIS.translations.get("link_bp_account_mixer_description"),
                    parent_subscription : ( params.parent_subscription_override!='' )?params.parent_subscription_override:'',
                    student_log_in_to_game_title : THIS.translations.get("student_log_in_to_game_title"),
                    student_log_in_to_game_message : THIS.translations.get("student_log_in_to_game_message"),
                    student_log_in_to_quiz_title : THIS.translations.get("student_log_in_to_quiz_title"),
                    student_log_in_to_quiz_message : THIS.translations.get("student_log_in_to_quiz_message"),
                    do_you_have_mybp_game : THIS.translations.get("do_you_have_mybp_game"),
                    game_offer_basic_teacher_message : THIS.translations.get("game_offer_basic_teacher_message"),
                    game_offer_basic_teacher_title : THIS.translations.get("game_offer_basic_teacher_title"),
                    teacher_basic_mybp_title : THIS.translations.get("teacher_basic_mybp_title"),
                    teacher_basic_mybp_message : THIS.translations.get("teacher_basic_mybp_message"),
                    search_hint : THIS.translations.get("search_hint"),
                    not_an_educator_account_message : THIS.translations.get("not_an_educator_account_message"),
                    have_an_educator_code : THIS.translations.get("have_an_educator_code"),
                    wrong_code_educators : THIS.translations.get("wrong_code_educators"),
                    verified : ( params.verified_override!='' )?params.verified_override:'',
                    refer : document.URL.replace('preview.weml', ''),
                    context : params.context,
                    colorscheme : params.colorscheme
                };
                
                $j(params.container).html(templatec(templateData));

                // LOAD THE UTILITY BAR JS FILE
                THIS.resources.load({resources_arr : [THIS.get('resources').utility_bar], load_params : {}, onLoadComplete : function(){
                    UtilityBar.init({
                        context : params.context,
                        product : params.product,
                        language : params.language,
                        user_type_override : params.user_type_override,
                        subscription_override : params.subscription_override,
                        parent_subscription_override : params.parent_subscription_override,
                        verified_override : params.verified_override,
                        colorscheme : params.colorscheme,
                        auto_expand : params.auto_expand
                    });
                }});
            
                THIS.templateManager.templates_path = params.templates_path_org; // RESTORE TEMPLATE PATH

            }, $j.extend({
                templates_path_org : templates_path_org,
                context : params.context,
                language : params.language,
                user_type_override : params.user_type_override,
                subscription_override : params.subscription_override,
                parent_subscription_override : params.parent_subscription_override,
                verified_override : params.verified_override,
                panel_css : params.panel_css,
                auto_expand : params.auto_expand,
                async : (params.async!==undefined)?params.async:true
            }, params));
        }
    };
    this.data = {
        getStates : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: params.async,
                url: "/core/services/get_states.weml",
                dataType: "json",
                data : {
                    none : params.none
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('error');
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        getCountries : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: params.async,
                url: "/core/services/get_countries.weml",
                dataType: "json",
                data : {
                    none : params.none,
                    countries_on_top : params.countries_on_top
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('error');
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        },
        getSchools : function(params){
            var ajax_res = '';
            $j.ajax({
                type: "GET",
                async: params.async,
                url: "/core/services/get_schools.weml",
                dataType: "json",
                data : {
                    zip_code : params.zipcode,
                    include_none_option : params.include_none_option,
                    include_other_option : params.include_other_option,
                    home_school : params.home_school,
                    parent_at_home : params.parent_at_home
                },
                cache: false,
                success: function(data) {
                    if(params.async){
                        if(params.onSuccess!==undefined){
                            params.onSuccess(data);
                        }
                    }else{
                        ajax_res = data;
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('error');
                }
            });
            if(params.async==false){
                return(ajax_res);
            }
        }
    };
    this.tracker = {
        ready : false, // SET TO FALSE IF THERE ARE ANY REQUIRED RESOURCES FOR THIS MODULE. WILL BE SET TO TRUE WHEN IT'S READY FOR USE.
        resources : [],  // THE RESOURCES REQUIRED FOR THIS MODULE.
        trackModule : function(params){
            if(_gaq!==undefined && params.module_name!==''){
               _gaq.push(['_trackPageview', params.module_name]);
            }
        }
    }
}).apply(core);core.init({});

}
/*
     FILE ARCHIVED ON 19:58:58 Mar 14, 2014 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 16:23:08 Feb 16, 2025.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.94
  exclusion.robots: 0.025
  exclusion.robots.policy: 0.015
  esindex: 0.01
  cdx.remote: 101.294
  LoadShardBlock: 206.457 (3)
  PetaboxLoader3.datanode: 188.33 (5)
  PetaboxLoader3.resolve: 323.767 (3)
  load_resource: 355.117 (2)
*/