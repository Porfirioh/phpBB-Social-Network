/**
 * 
 * @package phpBB Social Network
 * @version 0.6.3
 * @copyright (c) 2010-2012 Kamahl & Culprit http://phpbbsocialnetwork.com
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 * 
 */
(function($) {
	$.sn.up = {
	    url : '{U_UP_TAB_WALL}',
	    urlAJAX : '{U_UP_AJAXURL}',
	    urlSelectFriends : '{U_SELECT_FRIENDS}',
	    spinner : '<em>Loading&#8230;<\/em>',
	    nextText : '{L_NEXT}',
	    prevText : '{L_PREVIOUS}',
	    dateFormat : 'd. MM yy',
	    dayNames : [ 'Monday', 'Thusday', 'Wensday', 'Thursday', 'Friday', 'Suterday', 'Sunday' ],
	    dayNamesShort : [ '{L_SN_UP_SUNDAY_MIN}', '{L_SN_UP_MONDAY_MIN}', '{L_SN_UP_TUESDAY_MIN}', '{L_SN_UP_WEDNESDAY_MIN}', '{L_SN_UP_THURSDAY_MIN}', '{L_SN_UP_FRIDAY_MIN}', '{L_SN_UP_SATURDAY_MIN}' ],
	    monthNames : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
	    monthNamesShort : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
	    _inited : false,
	    tabReportUser : -1,
	    menuPosition : {
	        my : "right top",
	        at : "right bottom"
	    },


	    init : function(opts) {
		    if (!$.sn._inited) { return false; }
		    if ($.sn.enableModules.up == undefined || !$.sn.enableModules.up) { return false; }
		    $.sn._settings(this, opts);

		    if ($('#sn-up-profileTabs').size() > 0) {
			    var par_URL = $.sn.parseURL(window.location);
			    if (par_URL.hash == 'socialnet_us' && par_URL.params.status_id != null) {
				    $.sn.setCookie('sn_up_profileTab', 0);
			    }
			    $.sn.up.url = $.sn.up.url.replace(/&amp;/, '&');

			    $('#sn-up-profileTabs').tabs({
			        spinner : $.sn.up.spinner,
			        cookie : {
			            name : $.sn.cookie.name + 'sn_up_profileTab',
			            path : $.sn.cookie.path,
			            domain : $.sn.cookie.domain,
			            secure : $.sn.cookie.secure
			        },
			        create : function(e, ui) {
				        if ($.sn.getCookie('sn-up-profileTab') == 0) { return false }
			        },
			        select : function(e, ui) {
				        if (ui.index == 0) {
					        $.ajax({
					            type : 'POST',
					            dataType : 'html',
					            url : $.sn.up.url,
					            data : {
					                mode : 'wall',
					                u : par_URL.params.u
					            },
					            success : function(data) {
						            $('#sn-up-profileTabs-wall').html(data);
						            $('.sn-us-inputComment').watermark($.sn.us.watermark, {
						                useNative : false,
						                className : 'sn-us-watermark'
						            }).TextAreaExpander(22, 100).css({
							            height : '22px'
						            });
						            $("#sn-us-wallInput").watermark($.sn.us.watermark, {
						                useNative : false,
						                className : 'sn-us-watermark'
						            }).TextAreaExpander(22, 150).trigger('focusout');

					            }
					        });
				        }
				        $.sn._resize();

			        },
			        load : function(e, ui) {
				        $('#sn-us-wallInput').trigger('focusin').trigger('focusout');
				        $('.sn-up-editable').snEditable({
				            datePicker : {
				                dateFormat : $.sn.up.dateFormat,
				                monthNames : $.sn.up.monthNames,
				                monthNamesShort : $.sn.up.monthNamesShort
				            },
				            ajaxOptions : {
					            url : $.sn.up.urlAJAX
				            }
				        });
			        }
			    }).removeAttr('style');
		    }

		    if ($('.sn-up-reportUser a').size() > 0 && $('#sn-up-profileTabs').size() > 0) {
			    $('.sn-up-reportUser a').click(function() {
				    $.sn.up.tabCurrent = $('#sn-up-profileTabs').tabs('option', 'selected');
				    if ($.sn.up.tabReportUser != -1) {
					    $('#sn-up-profileTabs').tabs('select', $.sn.up.tabReportUser);
					    return false;
				    }
				    $.sn.up.tabReportUser = $('#sn-up-profileTabs').tabs('length');
				    $('#sn-up-profileTabs').tabs('add', '#sn-up-profileTabs-reportUser', $(this).html()).tabs('url', $.sn.up.tabReportUser, $(this).attr('href')).tabs('select', $.sn.up.tabReportUser);
				    var tabReportUser = $('#sn-up-profileTabs .ui-tabs-nav li a[href$=reportUser]');
				    tabReportUser.prepend('<span class="ui-icon ui-icon-close sn-action-tabClose">Remove Tab</span>');
				    $('#sn-up-profileTabs').tabs('select', $.sn.up.tabReportUser);
				    tabReportUser.prev('.ui-icon.ui-icon-close').css('cursor', 'pointer').click(function() {
					    $('#sn-up-reportUser input[name=cancel]').trigger('click');
				    });
				    return false;
			    });
		    }
		    
		    //$('a[href$=reportUser] .sn-action-tabClose').live('click', function() { << Nemelo by stacit toto?
		    $('#sn-up-profileTabs .ui-tabs-nav li a[href$=reportUser] .sn-action-tabClose').live('click', function() {
			    $('#sn-up-profileTabs').tabs('select', $.sn.up.tabCurrent).tabs('remove', $.sn.up.tabReportUser);
			    $.sn.up.tabReportUser = -1;
			    return false;
		    });

		    this._ucpProfile();
		    this._ucpRelations();
		    this._upMenu();

		    $.sn._resize();
	    },

	    _showHide : function(value_div, hide_div, values) {
		    var value = $(value_div).val();
		    var show = jQuery.inArray(value, values);

		    if (show != -1) {
			    $(hide_div).show();
		    } else {
			    $(hide_div).hide();
		    }
	    },

	    _ucpRelations : function() {
		    if ($('.sn-up-relations').size() == 0) { return; }

		    this._showHide("#sn-up-relationShipStatus", "#sn-up-relationShipPartner", [ "2", "3", "4", "5", "6" ]);
		    $("#sn-up-relationShipStatus").change(function() {
			    $.sn.up._showHide("#sn-up-relationShipStatus", "#sn-up-relationShipPartner", [ "2", "3", "4", "5", "6" ]);
		    });

		    this._showHide("#sn-up-familyStatus", "#sn-up-familyPartner", [ "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41" ]);
		    $("#sn-up-familyStatus").change(function() {
			    $.sn.up._showHide("#sn-up-familyStatus", "#sn-up-familyPartner", [ "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41" ]);
		    });

		    $.sn.up.urlSelectFriends = $.sn.up.urlSelectFriends.replace(/&amp;/g, '&');

		    $("#sn-up-relationShipUser, #sn-up-familyUser").autocomplete({
		        source : $.sn.up.urlSelectFriends,
		        minLength : 2,
		        delay : 300
		    });

		    $("#sn-up-annivesaryPicker").datepicker({
		        changeMonth : true,
		        changeYear : true,
		        appendText : '(dd-mm-yyyy)',
		        dateFormat : 'dd-mm-yy',
		        firstDay : 1,
		        nextText : $.sn.up.nextText,
		        prevText : $.sn.up.prevText,
		        yearRange : '1905:c',
		        dayNames : $.sn.up.dayNames,
		        dayNamesMin : $.sn.up.dayNamesShort,
		        monthNamesShort : $.sn.up.monthNamesShort
		    });

	    },

	    _ucpProfile : function() {
		    if ($('.sn-up-ucpProfile').size() == 0) { return; }

		    $('.sn-up-ucpProfile textarea[maxlength]').keyup(function() {
			    var limit = parseInt($(this).attr('maxlength'));
			    var text = $(this).val();
			    var chars = text.length;

			    if (chars > limit) {
				    var new_text = text.substr(0, limit);
				    $(this).val(new_text);
			    }
		    });

	    },

	    _upMenu : function() {
		    if ($('.sn-up-menu li').size() > 0) {
			    $('.sn-up-menu').css('z-index', 999).menu({
				    position : $.sn.up.menuPosition
			    });

			    $('.sn-up-menu .ui-icon-carat-1-e').toggleClass('ui-icon-carat-1-e ui-icon-carat-1-s');
			    $('.sn-up-menu > .ui-menu-item').css({
			        width : 'auto',
			        clear : 'none'
			    });

		    }

		    if ($('.sn-up-emote').size() > 0) {
			    $('.sn-up-emote a').click(function() {
				    var $this = $(this);
				    $.ajax({
				        type : 'POST',
				        dataType : 'json',
				        url : $.sn.up.urlAJAX,
				        cache : false,
				        async : true,
				        data : {
				            mode : 'emote',
				            emote : $.sn.getAttr($this, 'emote'),
				            u : $.sn.getAttr($this, 'u')
				        },
				        success : function(data) {
					        snConfirmBox(data.cbTitle, data.cbText);
				        }
				    });
			    });
		    }
	    }
	}
}(jQuery))