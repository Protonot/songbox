'use strict';
'require uci';
'require form';
'require view';
'require tools.widgets as widgets';
'require songbox';

return view.extend({
    render: function() {
        var m, s, o;

        m = new form.Map('songbox', _('SongBox Route'), _('Based on Sing-box, a universal proxy platform'));

        //Route Rules Setting
        s = m.section(form.GridSection, 'route_rules', _('Route Rules Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.tabbed = true;
        s.modaltitle = _('Add Route Rule');

        s.tab('general', _('General Settings'));
        s.tab('advanced', _('Advanced Settings'));

        o = s.taboption('general', form.Flag, 'enabled', _('Enabled'));
        o.rmempty = false;
        o.default = '1';

        o = s.taboption('general', form.ListValue, 'action', _('Action'));
        o.value('route', _('Route'));
        o.value('route-options', _('Route Options'));
        o.value('reject', _('Reject'));
        o.value('hijack-dns', _('Hijack DNS'));
        o.value('sniff', _('Sniff'));
        o.value('resolve', _('Resolve'));
        o.default = 'route';

        o = s.taboption('general', form.MultiValue, 'outbound', _('Outbound'), _('Tag of target outbound.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);
        o.rmempty = false;
        o.depends('action', 'route');

        o = s.taboption('general', form.Value, 'override_address', _('Override Address'), _('Override the connection destination address.'));
        o.datatype = 'or(ipaddr, host)';
        o.depends('action', 'route');
        o.depends('action', 'route-options');

        o = s.taboption('general', form.Value, 'override_port', _('Override Port'), _('Override the connection destination port.'));
        o.datatype = 'port';
        o.depends('action', 'route');
        o.depends('action', 'route-options');

        o = s.taboption('general', form.ListValue, 'udp_disable_domain_unmapping', _('UDP Disable Domain Unmapping'),
            _('If enabled, for UDP proxy requests addressed to a domain, the original packet address will be sent in the response instead of the mapped domain.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.depends('action', 'route');
        o.depends('action', 'route-options');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'udp_connect', _('UDP Connect'),
            _('If enabled, attempts to connect UDP connection to the destination instead of listen.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.depends('action', 'route');
        o.depends('action', 'route-options');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'udp_timeout', _('UDP Timeout'), _('Timeout for UDP connections.'));
        o.placeholder = '10s';
        o.depends('action', 'route');
        o.depends('action', 'route-options');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'method', _('Method'));
        o.value('default', _('Default'));
        o.value('drop', _('Drop'));
        o.default = 'default';
        o.depends('action', 'reject');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'no_drop', _('No Drop'),
            _('If not enabled, method will be temporarily overwritten to drop after 50 triggers in 30s. Not available when method is set to drop.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.rmempty = true;
        o.depends('action', 'reject');
        o.modalonly = true;

        o = s.taboption('general', form.MultiValue, 'sniffer', _('Sniffer'), _('All sniffers enabled by default.'));
        o.value('http', _('HTTP'));
        o.value('tls', _('TLS'));
        o.value('quic', _('QUIC'));
        o.value('stun', _('STUN'));
        o.value('dns', _('DNS'));
        o.value('bittorrent', _('BitTorrent'));
        o.value('dtls', _('DTLS'));
        o.value('ssh', _('SSH'));
        o.value('rdp', _('RDP'));
        o.depends('action', 'sniff');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'timeout', _('Timeout'), _('Timeout for sniffing.'));
        o.placeholder = '300ms';
        o.depends('action', 'sniff');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'strategy', _('Strategy'), _('dns.strategy will be used by default.'));
        o.value('prefer_ipv4', _('Prefer IPv4'));
        o.value('prefer_ipv6', _('Prefer IPv6'));
        o.value('ipv4_only', _('IPv4 Only'));
        o.value('ipv6_only', _('IPv6 Only'));
        o.value('', _(''));
        o.default = '';
        o.depends('action', 'resolve');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'server', _('Server'), 
            _('Specifies DNS server tag to use instead of selecting through DNS routing.'));
        o.value('', _(''));
        songbox.updateOptions('dns_server', o);
        o.depends('action', 'resolve');
        o.modalonly = true;

        // ============================================

        o = s.taboption('general', form.MultiValue, 'rule_set', _('Rule Set'), _('Match rule set.'));
        o.value('', _(''));
        songbox.updateOptions('global_rule_sets', o);

        o = s.taboption('general', form.MultiValue, 'inbound', _('Inbound'), _('The tag of the inbound.'));
        o.value('', _(''));
        songbox.updateOptions('inbound', o);

        o = s.taboption('general', form.ListValue, 'ip_version', _('IP Version'), _('Not limited if empty.'));
        o.value('4', _('IPv4'));
        o.value('6', _('IPv6'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        o = s.taboption('general', form.DynamicList, 'query_type', _('Query Type'), _('DNS query type. Values can be integers or type name strings.'));
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'network', _('Network'));
        o.value('tcp', _('TCP'));
        o.value('udp', _('UDP'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        o = s.taboption('general', form.MultiValue, 'protocol', _('Sniffed Protocol'));
        o.value('http', _('HTTP'));
        o.value('tls', _('TLS'));
        o.value('quic', _('QUIC'));
        o.value('stun', _('STUN'));
        o.value('dns', _('DNS'));
        o.value('bittorrent', _('BitTorrent'));
        o.value('dtls', _('DTLS'));
        o.value('ssh', _('SSH'));
        o.value('rdp', _('RDP'));
        o.modalonly = true;

        o = s.taboption('general', form.MultiValue, 'client', _('Client'), _('Sniffed client type.'));
        o.value('chrimium', _('Chromium'));
        o.value('safari', _('Safari'));
        o.value('firefox', _('Firefox'));
        o.value('quic-go', _('QUIC-Go'));
        o.modalonly = true;

        o = s.taboption('general', form.DynamicList, 'domain', _('Domain'), _('Match full domain.'));
        o.datatype = 'host';
        o.modalonly = true;

        o = s.taboption('general', form.DynamicList, 'domain_suffix', _('Domain Suffix'), _('Match domain suffix.'));
        o.modalonly = true;

        o = s.taboption('general', form.DynamicList, 'domain_keyword', _('Domain Keyword'), _('Match domain using keyword.'));
        o.modalonly = true;

        o = s.taboption('general', form.DynamicList, 'domain_regex', _('Domain Regex'), _('Match domain using regular expression.'));
        o.modalonly = true;

        o = s.taboption('advanced', form.DynamicList, 'source_ip_cidr', _('Source IP CIDR'), _('Match source IP CIDR.'));
        o.placeholder = '10.0.0.0/24 or 192.168.0.1'
        o.datatype = 'ipaddr';
        o.modalonly = true;

        o = s.taboption('advanced', form.ListValue, 'source_ip_is_private', _('Source IP is Private'), _('Match non-public source IP.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        o = s.taboption('advanced', form.DynamicList, 'source_port', _('Source Port'), _('Match source port.'));
        o.placeholder = '80'
        o.datatype = 'port';
        o.modalonly = true;

        o = s.taboption('advanced', form.DynamicList, 'source_port_range', _('Source Port Range'), _('Match source port range.'));
        o.placeholder = '1000:2000'
        o.datatype = 'or(portrange, range(0, 65535), :)';
        o.modalonly = true;

        o = s.taboption('advanced', form.DynamicList, 'port', _('Port'), _('Match port.'));
        o.placeholder = '80'
        o.datatype = 'port';
        o.modalonly = true;

        o = s.taboption('advanced', form.DynamicList, 'port_range', _('Port Range'), _('Match port range.'));
        o.placeholder = '1000:2000'
        o.datatype = 'or(portrange, range(0, 65535), :)';
        o.modalonly = true;

        o = s.taboption('advanced', form.DynamicList, 'ip_cidr', _('IP CIDR'), _('Match IP CIDR.'));
        o.placeholder = '10.0.0.0/24 or 192.168.0.1'
        o.datatype = 'ipaddr';
        o.modalonly = true;

        o = s.taboption('advanced', form.ListValue, 'ip_is_private', _('IP is Private'), _('Match non-public IP.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        o = s.taboption('advanced', form.ListValue, 'rule_set_ip_cidr_accept_empty', _('Make ip_cidr rules in rule-sets accept empty query response.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.modalonly = true;

        o = s.taboption('advanced', form.ListValue, 'clash_mode', _('Clash Mode'), _('Clash mode.'));
        o.value('rule', _('Rule'));
        o.value('direct', _('Direct'));
        o.value('global', _('Global'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        o = s.taboption('advanced', form.ListValue, 'invert', _('Invert'), _('Invert match result.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        // ============================================
        // Route Advanced Setting
        s = m.section(form.TypedSection, 'route_advanced', _('Route Advanced Setting'));
        s.anonymous = true;

        o = s.option(form.ListValue, 'final', _('Final'), _('Default outbound tag. the first outbound will be used if empty.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);

        o = s.option(form.Flag, 'auto_detect_interface', _('Auto Detect Interface'), 
            _('Bind outbound connections to the default NIC by default to prevent routing loops under tun.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'true';
        o.rmempty = false;

        o = s.option(widgets.NetworkSelect, 'default_interface', _('Default Interface'), 
            _('Bind outbound connections to the specified NIC by default to prevent routing loops under tun.'));
        o.depends('auto_detect_interface', 'false');

        o = s.option(form.Value, 'default_mark', _('Default Mark'), _('Set routing mark by default.'));
        o.placeholder = '0';
        o.datatype = 'uinteger';
        
        // ============================================
        // Global Rule Sets Setting
        s = m.section(form.GridSection, 'global_rule_sets', _('Rule Sets Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.modaltitle = _('Add Rule Set');

        o = s.option(form.ListValue, 'tag', _('Tag'), _('The tag of the rule set.'));
        o.rmempty = false;
        songbox.updaterulesetOptions('geoip', o);
        songbox.updaterulesetOptions('geosite', o);
        songbox.updaterulesetOptions('acl4ssr', o);

        o = s.option(form.ListValue, 'type', _('Type'));
        o.value('local', _('Local'));
        o.value('remote', _('Remote'));
        o.default = 'remote';

        o = s.option(form.ListValue, 'format', _('Format'));
        o.value('source', _('Source'));
        o.value('binary', _('Binary'));
        o.default = 'binary';

        o = s.option(form.Value, 'path', _('Path'));
        o.default = '';
        o.placeholder = '/path/to/rule-set/geoip-cn.srs';
        o.depends('type', 'local');

        o = s.option(form.Value, 'url', _('URL'));
        o.default = '';
        o.placeholder = 'https://example.com/rule-set/geoip-cn.srs';
        o.depends('type', 'remote');

        o = s.option(form.Value, 'download_detour', _('Download Detour'), 
            _('Tag of the outbound to download rule-set. Default outbound will be used if empty.'));
        o.rmempty = true;
        o.depends('type', 'remote');
        
        o = s.option(form.Value, 'update_interval', _('Update Interval'), 
            _('Update interval of rule-set. 1d will be used if empty.'));
        o.rmempty = true;
        o.depends('type', 'remote');

        return m.render();
    }
});