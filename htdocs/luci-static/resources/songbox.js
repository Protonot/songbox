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

    updaterulesetOptions: function(optionName, optionInstance) {
        L.resolveDefault(uci.load('songbox'), {}).then(function() {
            var rule_paths = uci.get('songbox', 'geo', optionName) || [];
            rule_paths.forEach(function(path) {
                optionInstance.value(path, path);
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