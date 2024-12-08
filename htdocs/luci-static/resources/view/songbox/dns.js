'use strict';
'require uci';
'require form';
'require view';
'require songbox';

return view.extend({
    render: function() {
        var m, s, o;

        m = new form.Map('songbox', _('SongBox DNS'), _('Based on Sing-box, a universal proxy platform'));

        s = m.section(form.GridSection, 'dns_server', _('DNS Server Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.tabbed = true;
        s.modaltitle = _('Add DNS Server');

        o = s.option(form.Flag, 'enabled', _('Enabled'));
        o.rmempty = false;
        o.default = '1';

        // tag
        o = s.option(form.Value, 'tag', _('DNS Tag'), _('The tag of the dns server.'));
        o.placeholder = 'dns_proxy';
        o.rmempty = false;
        // address
        o = s.option(form.Value, 'address', _('DNS Address'));
        o.datatype = 'or(host, ipaddr, ip6addr, string)';
        o.rmempty = false;
        // address resolver
        o = s.option(form.Value, 'address_resolver', _('DNS Address Resolver'), 
            _('Tag of a another server to resolve the domain name in the address. Required if address contains domain'));
        o.placeholder = 'dns_resolver';

        // address strategy
        o = s.option(form.ListValue, 'address_strategy', _('DNS Address Strategy'), _('The domain strategy for resolving the domain name in the address.'));
        o.value('', _(''));
        o.value('prefer_ipv4', _('Prefer IPv4'));
        o.value('prefer_ipv6', _('Prefer IPv6'));
        o.value('ipv4_only', _('IPv4 Only'));
        o.value('ipv6_only', _('IPv6 Only'));
        o.default = '';
        o.modalonly = true;

        // strategy
        o = s.option(form.ListValue, 'strategy', _('DNS Strategy'), _('Default domain strategy for resolving the domain names.'));
        o.value('', _(''));
        o.value('prefer_ipv4', _('Prefer IPv4'));
        o.value('prefer_ipv6', _('Prefer IPv6'));
        o.value('ipv4_only', _('IPv4 Only'));
        o.value('ipv6_only', _('IPv6 Only'));
        o.default = '';
        o.modalonly = true;

        // detour
        o = s.option(form.ListValue, 'detour', _('DNS Detour'), _('Tag of an outbound for connecting to the dns server.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);
        o.modalonly = true;

        // client subnet
        o = s.option(form.Value, 'client_subnet', _('Client Subnet'));
        o.modalonly = true;

        // ================================================================
        // DNS Rules Setting
        s = m.section(form.GridSection, 'dns_rules', _('DNS Rules Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.tabbed = true;
        s.modaltitle = _('Add DNS Rule');

        s.tab('general', _('General Settings'));
        s.tab('advanced', _('Advanced Settings'));

        o = s.taboption('general', form.Flag, 'enabled', _('Enabled'));
        o.rmempty = false;
        o.default = '1';
        o.editable = true;

        o = s.taboption('general', form.ListValue, 'action', _('Action'));
        o.value('route', _('Route'));
        o.value('route-options', _('Route Options'));
        o.value('reject', _('Reject'));
        o.default = 'route';

        o = s.taboption('general', form.ListValue, 'server', _('Server'), _('Tag of target server.'));
        o.value('', _(''));
        songbox.updateOptions('dns_server', o);
        o.rmempty = false;
        o.depends('action', 'route');

        o = s.taboption('general', form.ListValue, 'disable_cache', _('Disable Cache'), _('Disable cache and save cache in this query.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.depends('action', 'route');
        o.depends('action', 'route-options');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'rewrite_ttl', _('Rewrite TTL'), _('Rewrite TTL in DNS responses.'));
        o.depends('action', 'route');
        o.depends('action', 'route-options');
        o.datatype = 'range(0, 3600)';
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'client_subnet', _('Client Subnet'));
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

        o = s.taboption('general', form.MultiValue, 'rule_set', _('Rule Set'), _('Match rule set.'));
        o.value('', _(''));
        songbox.updateOptions('global_rule_sets', o);

        o = s.taboption('general', form.MultiValue, 'inbound', _('Inbound'), _('The tag of the inbound.'));
        o.value('', _(''));
        songbox.updateOptions('inbound', o);

        o = s.taboption('general', form.MultiValue, 'outbound', _('Outbound'), _('The tag of the outbound.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);

        o = s.taboption('general', form.ListValue, 'ip_version', _('IP Version'), _('Not limited if empty.'));
        o.value('4', _('IPv4'));
        o.value('6', _('IPv6'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        o = s.taboption('general', form.DynamicList, 'query_type', _('Query Type'), _('DNS query type. Values can be integers or type name strings.'));

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

        o = s.taboption('advanced', form.DynamicList, 'ip_cidr', _('IP CIDR'), _('Match IP CIDR with query response.'));
        o.placeholder = '10.0.0.0/24 or 192.168.0.1'
        o.datatype = 'ipaddr';
        o.modalonly = true;

        o = s.taboption('advanced', form.ListValue, 'ip_is_private', _('IP is Private'), _('Match private IP with query response.'));
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
        // Fake IP
        s = m.section(form.TypedSection, 'dns_fakeip', _('Fake IP Setting'));
        s.anonymous = true;

        o = s.option(form.Flag, 'enabled', _('Enabled'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = true;
        o.rmempty = false;

        o = s.option(form.Value, 'inet4_range', _('IPv4 Range'));
        o.datatype = 'ip4addr';
        o.rmempty = false;
        o.placeholder = '198.18.0.0/15';

        o = s.option(form.Value, 'inet6_range', _('IPv6 Range'));
        o.datatype = 'ip6addr';
        o.rmempty = true;
        o.placeholder = 'fc00::/18';

        // ============================================
        // DNS Advanced Setting
        s = m.section(form.TypedSection, 'dns_advanced', _('DNS Advanced Setting'));
        s.anonymous = true;

        o = s.option(form.ListValue, 'final', _('Final'), _('Default dns server tag.'));
        o.value('', _(''));
        songbox.updateOptions('dns_server', o);

        o = s.option(form.ListValue, 'strategy', _('DNS Strategy'), _('Default domain strategy for resolving the domain names.'));
        o.value('', _(''));
        o.value('prefer_ipv4', _('Prefer IPv4'));
        o.value('prefer_ipv6', _('Prefer IPv6'));
        o.value('ipv4_only', _('IPv4 Only'));
        o.value('ipv6_only', _('IPv6 Only'));
        o.default = '';

        o = s.option(form.ListValue, 'disable_cache', _('Disable Cache'), _('Disable dns cache.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';

        o = s.option(form.ListValue, 'disable_expire', _('Disable Expire'), _('Disable dns cache expire.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';

        o = s.option(form.ListValue, 'independent_cache', _('Independent Cache'), _('Make each DNS server\'s cache independent for special purposes. If enabled, will slightly degrade performance.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = true;

        o = s.option(form.Value, 'cache_capacity', _('Cache Capacity'), _('LRU cache capacity.'));
        o.datatype = 'uinteger';
        o.rmempty = true;

        o = s.option(form.ListValue, 'reverse_mapping', _('Reverse Mapping'), _('Enable reverse mapping.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';

        o = s.option(form.Value, 'client_subnet', _('Client Subnet'));
        o.rmempty = true;
        
        // ============================================
        // Global Rule Sets Setting
        s = m.section(form.GridSection, 'global_rule_sets', _('Rule Sets Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.modaltitle = _('Add Rule Set');

        // var rule_option = s.option(form.ListValue, 'rule_option', _('Rule Option'));
        // rule_option.value('geoip', _('GeoIP'));
        // rule_option.value('geosite', _('GeoSite'));
        // rule_option.value('acl4ssr', _('ACL4SSR'));

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