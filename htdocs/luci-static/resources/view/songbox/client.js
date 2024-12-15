'use strict';
'require uci';
'require form';
'require view';
'require songbox';

return view.extend({
	render: function() {
		var m, s, o;

        m = new form.Map('songbox', _('SongBox Client'), _('Based on Sing-box, a universal proxy platform'));

        s = m.section(form.TypedSection, 'client', _('Client Setting'));
        s.anonymous = true;

        o = s.option(form.Flag, 'enabled', _('Enabled'));
        o.default = '1';
        o.rmempty = false;

        o = s.option(form.ListValue, 'singbox_mode', _('Singbox Mode'));
        o.value('0', _('Redirect TCP & Tproxy UDP'));
        o.value('1', _('Tun'));
        o.default = '0';

        s = m.section(form.TypedSection, 'log', _('Log Setting'));
        s.anonymous = true;

        o = s.option(form.Flag, 'disabled', _('Disabled Log'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.rmempty = false;

        o = s.option(form.ListValue, 'level', _('Log Level'));
        o.value('trace', _('Trace'));
        o.value('debug', _('Debug'));
        o.value('info', _('Info'));
        o.value('warn', _('Warn'));
        o.value('error', _('Error'));
        o.value('fatal', _('Fatal'));
        o.value('Panic', _('Panic'));
        o.default = 'info';
        o.depends('disabled', 'false');

        o = s.option(form.HiddenValue, 'output');
        o.default = '/var/run/songbox/singbox.log';
        o.readonly = true;
        o.depends('disabled', 'false');

        o = s.option(form.Flag, 'timestamp', _('Timestamp'), _('Add timestamp to each line.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'true';
        o.rmempty = false;
        o.depends('disabled', 'false');

        s = m.section(form.TypedSection, 'ntp', _('NTP Setting'));
        s.anonymous = true;

        o = s.option(form.Flag, 'enabled', _('Enable NTP'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.rmempty = false;

        o = s.option(form.Value, 'server', _('NTP Server'));
        o.datatype = 'host';
        o.default = 'time.apple.com';
        o.depends('enabled', 'true');

        o = s.option(form.Value, 'server_port', _('NTP Port'));
        o.datatype = 'port';
        o.default = '123';
        o.depends('enabled', 'true');

        o = s.option(form.Value, 'interval', _('NTP Interval'));
        o.datatype = 'string';
        o.default = '30m';
        o.placeholder = '30m';
        o.depends('enabled', 'true');

        s = m.section(form.TypedSection, 'experimental', _('Experimental Setting'));
        s.anonymous = true;

        s.tab('cache', _('Cache Setting'));
        s.tab('clash_api', _('Clash API Setting'));

        o = s.taboption('cache', form.Flag, 'enabled', _('Cache Enabled'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'true';
        o.rmempty = false;

        o = s.taboption('cache', form.Value, 'path', _('Cache Path'), _('cache.db will be used if empty.'));
        o.default = '';
        o.depends('enabled', 'true');

        o = s.taboption('cache', form.Value, 'cache_id', _('Cache ID'));

        o = s.taboption('cache' ,form.Flag, 'store_fakeip', _('Store Fake IP'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'true';
        o.rmempty = false;
        o.depends('enabled', 'true');

        o = s.taboption('cache', form.Flag, 'store_rdrc', _('Store RDRC'), _('Store rejected DNS response cache in the cache file.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.rmempty = false;
        o.depends('enabled', 'true');

        o = s.taboption('cache', form.Value, 'rdrc_timeout', _('RDRC Timeout'), _('Timeout of rejected DNS response cache.'));
        o.placeholder = '7d';

        o = s.taboption('clash_api', form.Value, 'external_controller', _('External Controller'));
        
        o = s.taboption('clash_api', form.Value, 'secret', _('Secret'));
        o.password = true;
        o.default = ''

        o = s.taboption('clash_api', form.Value, 'external_ui', _('External UI'));
        o.default = '/var/etc/singbox/ui';
        o.readonly = true;

        o = s.taboption('clash_api', form.ListValue, 'external_ui_download_url', _('External UI Download URL'));
        o.value('https://github.com/MetaCubeX/Yacd-meta/archive/gh-pages.zip', _('YMetaCubeX'));
        o.value('https://github.com/haishanh/yacd/archive/gh-pages.zip', _('Yacd'));
        o.default = 'https://github.com/MetaCubeX/Yacd-meta/archive/gh-pages.zip'

        o = s.taboption('clash_api', form.ListValue, 'external_ui_download_detour', _('External UI Download Detour'),
            _('The tag of the outbound to download the external UI.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);

		return m.render();
	},
});