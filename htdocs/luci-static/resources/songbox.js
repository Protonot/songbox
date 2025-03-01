'use strict';
'require uci';
'require form';
'require baseclass';
'require ui';
'require request';

return baseclass.extend({
    updateOptions: function(sectionName, optionInstance) {
        L.resolveDefault(uci.load('songbox'), {}).then(function() {
            uci.sections('songbox', sectionName, function(section) {
                var tag = uci.get('songbox', section['.name'], 'tag');
                if (tag) {
                    optionInstance.value(tag, tag);
                }
            });
        });
    },

    validateBandwidth: function(value) {
        var regex = /^\d+\s*(bps|Bps|Kbps|KBps|Mbps|MBps|Gbps|GBps|Tbps|TBps)?$/;
        if (regex.test(value)) {
            return true;
        } else {
            ui.addNotification(null, E('p', _('Invalid bandwidth value.')), 'error');
        }
    },

});