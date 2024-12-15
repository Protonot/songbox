'use strict';
'require uci';
'require form';
'require view';
'require ui';
'require fs';
'require tools.widgets as widgets';
'require songbox';

return view.extend({
    render: function() {
        var m, s, o, ss, so;

        m = new form.Map('songbox');

        // =============================================================
        // InBound Setting
        s = m.section(form.GridSection, 'inbound', _('InBound Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.tabbed = true;
        s.modaltitle = _('Add InBound');

        s.tab('general', _('General Settings'));
        s.tab('listenfields', _('Listen Fields'));

        o = s.taboption('general', form.Flag, 'enabled', _('Enabled'));
        o.default = '1';
        o.rmempty = false;

        o = s.taboption('general', form.Value, 'tag', _('Tag'));
        o.placeholder = 'direct-in';
        o.rmempty = false;

        o = s.taboption('general', form.ListValue, 'type', _('Type'));
        o.value('direct', _('Direct'));
        o.value('mixed', _('Mixed'));
        o.value('socks', _('Socks'));
        o.value('http', _('HTTP'));
        o.value('shadowsocks', _('Shadowsocks'));
        o.value('vmess', _('VMESS'));
        o.value('trojan', _('Trojan'));
        o.value('naive', _('Naive'));
        o.value('hysteria', _('Hysteria'));
        o.value('shadowtls', _('ShadowTLS'));
        o.value('vless', _('VLESS'));
        o.value('tuic', _('TUIC'));
        o.value('hysteria2', _('Hysteria2'));
        o.value('tun', _('Tun'));
        o.value('redirect', _('Redirect'));
        o.value('tproxy', _('TProxy'));
        o.rmempty = false;

        o = s.taboption('general', form.Value, 'users_username', _('Username'));
        o.depends('type', 'mixed');
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'shadowsocks');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'naive');
        o.depends('type', 'hysteria');
        o.depends({ type: 'shadowtls', "version": '3' });
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');
            
        o = s.taboption('general', form.Value, 'users_password', _('Password'));
        o.password = true;
        o.depends('type', 'mixed');
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'shadowsocks');
        o.depends('type', 'trojan');
        o.depends('type', 'naive');
        o.depends({ type: 'shadowtls', "version": '3' });
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Value, 'users_uuid', _('UUID'));
        o.depends('type', 'vmess');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'users_flow', _('Flow'));
        o.value('', _(''));
        o.value('xtls-rprx-vision', _('XTLS-RPRX-Vision'));
        o.depends('type', 'vless');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'users_auth', _('Auth'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'users_auth', _('Auth'), _('Authentication password, in base64.'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'users_auth_str', _('Auth Str'), _('Authentication password.'));
        o.depends('type', 'hysteria');
        o.password = true;
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'users_alterId', _('Alter ID'));
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'override_address', _('Override Address'));
        o.placeholder = '1.0.0.1';
        o.datatype = 'ipaddr';
        o.depends('type', 'direct');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'override_port', _('Override Port'));
        o.placeholder = '53';
        o.datatype = 'port';
        o.depends('type', 'direct');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'network', _('Network'));
        o.value('tcp', _('TCP'));
        o.value('udp', _('UDP'));
        o.value('', _('TCP & UDP'));
        o.default = '';
        o.depends('type', 'direct');
        o.depends('type', 'naive');
        o.depends('type', 'tproxy');
        o.modalonly = true;

        // o = s.taboption('general', form.Button, '_users', _('Users'));
        // o.inputtitle = _('Edit Users');
        // o.inputstyle = 'action';
        // o.modalonly = true;
        // o.depends('type', 'mixed');
        // o.depends('type', 'socks');
        // o.depends('type', 'http');
        // o.depends('type', 'shadowsocks');
        // o.depends('type', 'vmess');
        // o.depends('type', 'trojan');
        // o.depends('type', 'naive');
        // o.depends('type', 'vless');

        // o.onclick = function(ev) {
        //     var section_id = this.section.section;
        //     console.log('section_id:', section_id);
        //     var tag = this.map.lookupOption('tag', section_id)[0].formvalue(section_id);
        //     console.log('tag:', tag);
        //     var mm = new form.Map('songbox', _('Edit Users'), _('Edit') + tag + _(' Users'));

        //     ss = mm.section(form.GridSection, 'users');
        //     ss.anonymous = true;
        //     ss.addremove = true;
        //     ss.sortable = true;
        //     ss.modaltitle = _('Edit User');


        //     ss.filter = function(section_id) {
        //         return uci.get('songbox', section_id, 'parent_tag') === tag;
        //     };

        //     so = ss.option(form.HiddenValue, 'parent_tag');
        //     so.default = tag;
        //     so.modalonly = true;
        //     so.readonly = true;

        //     so = ss.option(form.Value, 'users_username', _('Username'));
            
        //     so = ss.option(form.Value, 'users_password', _('Password'));
        //     so.password = true;
        //     so.depends({ type: 'vmess', "!reverse": true });
        //     so.depends({ type: 'hysteria', "!reverse": true });
        //     so.depends({ type: 'vless', "!reverse": true });

        //     so = ss.option(form.Value, 'users_uuid', _('UUID'));
        //     so.depends('type', 'vmess');
        //     so.depends('type', 'vless');
        //     so.depends('type', 'tuic');
        //     so.modalonly = true;

        //     so = ss.option(form.ListValue, 'users_flow', _('Flow'));
        //     so.value('', _(''));
        //     so.value('xtls-rprx-vision', _('XTLS-RPRX-Vision'));
        //     so.depends('type', 'vless');
        //     so.modalonly = true;

        //     so = ss.option(form.Value, 'users_auth', _('Auth'));
        //     so.depends('type', 'hysteria');
        //     so.modalonly = true;

        //     so = ss.option(form.Value, 'users_auth', _('Auth'), _('Authentication password, in base64.'));
        //     so.depends('type', 'hysteria');
        //     so.modalonly = true;

        //     so = ss.option(form.Value, 'users_auth_str', _('Auth Str'), _('Authentication password.'));
        //     so.depends('type', 'hysteria');
        //     so.password = true;
        //     so.modalonly = true;

        //     so = ss.option(form.Value, 'users_alterId', _('Alter ID'));
        //     so.depends('type', 'vless');
        //     so.modalonly = true;

        //     mm.render().then(function(nodes) {
        //         ui.showModal(_('Edit Users for InBound: ') + tag, [
        //             nodes,
        //             E('div', { 'class': 'right' }, [
        //                 E('button', {
        //                     'class': 'btn',
        //                     'click': function() {
        //                         mm.save(null, true).then(function() {
        //                             ui.hideModal();
        //                         });
        //                     }
        //                 }, _('Save')),
        //                 ' ',
        //                 E('button', {
        //                     'class': 'btn',
        //                     'click': function() {
        //                         ui.hideModal();
        //                     }
        //                 }, _('Cancel'))
        //             ])
        //         ]);
        //     });
        
        //     // return false;
        // };

        o = s.taboption('general', form.ListValue, 'method', _('Method'));
        o.value('2022-blake3-aes-128-gcm', _('2022-blake3-aes-128-gcm'));
        o.value('2022-blake3-aes-256-gcm', _('2022-blake3-aes-256-gcm'));
        o.value('2022-blake3-chacha20-poly1305', _('2022-blake3-chacha20-poly1305'));
        o.value('none', _('None'));
        o.value('aes-128-gcm', _('AES-128-GCM'));
        o.value('aes-192-gcm', _('AES-192-GCM'));
        o.value('aes-256-gcm', _('AES-256-GCM'));
        o.value('chacha20-ietf-poly1305', _('Chacha20-IETF-Poly1305'));
        o.value('xchacha20-ietf-poly1305', _('XChacha20-IETF-Poly1305'));
        o.default = 'none';
        o.rmempty = false;
        o.modalonly = true;
        o.depends('type', 'shadowsocks');

        o = s.taboption('general', form.Value, 'password', _('Password'));
        o.password = true;
        o.rmempty = false;
        o.modalonly = true;
        o.depends('type', 'shadowsocks');
        o.depends({ type: 'shadowtls', "version": '2' });

        o = s.taboption('general', form.Flag, 'fallback_enabled', _('Fallback'));
        o.modalonly = true;
        o.depends('type', 'trojan');

        o = s.taboption('general', form.Value, 'fallback_server', _('Fallback Server'));
        o.datatype = 'host';
        o.modalonly = true;
        o.depends('fallback_enabled', '1');

        o = s.taboption('general', form.Value, 'fallback_port', _('Fallback Port'));
        o.placeholder = '443';
        o.datatype = 'port';
        o.modalonly = true;
        o.depends('fallback_enabled', '1');

        o = s.taboption('general', form.Value, 'up', _('Up'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100 Mbps'
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'down', _('Down'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100 Mbps'
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'up_mbps', _('Up Mbps'), _('in Mbps.'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100';
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'down_mbps', _('Down Mbps'), _('in Mbps.'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100';
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'obfs', _('Obfs'), _('Obfuscated password.'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'recv_window_conn', _('Recv Window Conn'),
            _('The QUIC stream-level flow control window for receiving data.'));
        o.datatype = 'uinteger';
        o.placeholder = '15728640';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'recv_window_client', _('Recv Window Client'),
            _('The QUIC connection-level flow control window for receiving data.'));
        o.datatype = 'uinteger';
        o.placeholder = '67108864';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'max_conn_client', _('Max Conn Client'),
            _('The maximum number of QUIC concurrent bidirectional streams that a peer is allowed to open.'));
        o.datatype = 'uinteger';
        o.placeholder = '1024';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Flag, 'disable_mtu_discovery', _('Disable MTU Discovery'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'version', _('Version'));
        o.value('1');
        o.value('2');
        o.value('3');
        o.default = '1';
        o.depends('type', 'shadowtls');
        o.modalonly = true;

        o = s.taboption('general', form.Flag, 'strict_mode', _('Strict Mode'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.depends({ type: 'shadowtls', "version": '3' });

        o = s.taboption('general', form.ListValue, 'congestion_control', _('Congestion Control'));
        o.value('cubic', _('Cubic'));
        o.value('new_reno', _('New Reno'));
        o.value('bbr', _('BBR'));
        o.default = 'cubic';
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'auth_timeout', _('Auth Timeout'));
        o.placeholder = '3s';
        o.modalonly = true;
        o.depends('type', 'tuic');

        o = s.taboption('general', form.Flag, 'zero_rtt_handshake', _('Zero RTT Handshake'), _('Disabling this is highly recommended,'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('type', 'tuic');

        o = s.taboption('general', form.Value, 'heartbeat', _('Heartbeat'));
        o.placeholder = '10s';
        o.modalonly = true;
        o.depends('type', 'tuic');

        o = s.taboption('general', form.Value, 'obfs_type', _('QUIC traffic obfuscator type'),
            _('Only available with salamander.'));
        o.placeholder = 'salamander'
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'obfs_password', _('QUIC traffic obfuscator password.'));
        o.depends('type', 'hysteria2');
        o.modalonly = true;
        o.password = true;
        
        o = s.taboption('general', form.Flag, 'ignore_client_bandwidth', _('Ignore Client Bandwidth'),
            _('Commands the client to use the BBR flow control algorithm instead of Hysteria CC.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Flag, 'brutal_debug', _('Brutal Debug'),
            _('Enable debug information logging for Hysteria Brutal CC.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.rmempty = false;
        o.modalonly = true;
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Value, 'interface_name', _('Interface Name'));
        o.default = 'songbox-tun';
        o.rmempty = false;
        o.modalonly = true;
        o.depends('type', 'tun');

        o = s.taboption('general', form.DynamicList, 'address', _('Address'), _('IPv4 and IPv6 prefix for the tun interface.'));
        o.placeholder = '172.18.0.1/30';
        o.rmempty = false;
        o.modalonly = true;
        o.depends('type', 'tun');

        o = s.taboption('general', form.Value, 'mtu', _('MTU'));
        o.placeholder = '1500';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('type', 'tun');

        o = s.taboption('general', form.Flag, 'auto_route', _('Auto Route'), 
            _('Set the default route to the Tun. To avoid traffic loopback, set route.auto_detect_interface or route.default_interface or outbound.bind_interface'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'true';
        o.modalonly = true;
        o.depends('type', 'tun');

        o = s.taboption('general', form.Value, 'iproute2_table_index', _('IPRoute2 Table Index'));
        o.placeholder = '2022';
        o.modalonly = true;
        o.depends('type', 'tun');

        o = s.taboption('general', form.Value, 'iproute2_rule_index', _('IPRoute2 Rule Index'));
        o.placeholder = '9000';
        o.modalonly = true;
        o.depends('type', 'tun');

        o = s.taboption('general', form.Flag, 'auto_redirect', _('Auto Redirect'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'true';
        o.modalonly = true;
        o.depends('auto_route', 'true');

        o = s.taboption('general', form.Value, 'auto_redirect_input_mark', _('Auto Redirect Input Mark'));
        o.placeholder = '0x2023';
        o.modalonly = true;
        o.depends('auto_redirect', 'true');

        o = s.taboption('general', form.Value, 'auto_redirect_output_mark', _('Auto Redirect Output Mark'));
        o.placeholder = '0x2024';
        o.modalonly = true;
        o.depends('auto_redirect', 'true');

        o = s.taboption('general', form.Flag, 'strict_route', _('Strict Route'),
            _('Enforce strict routing rules when auto_route is enabled'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'true';
        o.modalonly = true;
        o.depends('auto_route', 'true');

        o = s.taboption('general', form.DynamicList, 'route_address', _('Route Address'),
            _('Use custom routes instead of default when auto_route is enabled.'));
        o.modalonly = true;
        o.depends('auto_route', 'true');

        o = s.taboption('general', form.DynamicList, 'route_exclude_address', _('Route Exclude Address'),
            _('Exclude custom routes when auto_route is enabled.'));
        o.modalonly = true;
        o.depends('auto_route', 'true');

        o = s.taboption('general', form.DynamicList, 'route_address_set', _('Route Address Set'),
            _('Only supported on Linux with nftables.'));
        o.modalonly = true;
        o.depends('auto_redirect', 'true');

        o = s.taboption('general', form.DynamicList, 'route_exclude_address_set', _('Route Exclude Address Set'),
            _('Only supported on Linux with nftables.'));
        o.modalonly = true;
        o.depends('auto_redirect', 'true');

        // o = s.taboption('general', form.Value, 'udp_timeout', _('UDP Timeout'), _('UDP NAT expiration time.'));
        // o.placeholder = '5m';
        // o.modalonly = true;
        // o.depends('type', 'tun');

        o = s.taboption('general', form.ListValue, 'stack', _('Stack'));
        o.value('gvisor', _('Gvisor'));
        o.value('system', _('System'));
        o.value('mixed', _('Mixed'));
        o.default = 'mixed';
        o.modalonly = true;
        o.depends('type', 'tun');

        o = s.taboption('general', form.Flag, 'endpoint_independent_nat', _('Endpoint Independent NAT'),
            _('This item is only available on the gvisor stack, other stacks are endpoint-independent NAT by default.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('stack', 'gvisor');

        o = s.taboption('general', form.DynamicList, 'include_interface', _('Include Interface'),
            _('Conflicts with exclude_interface.'));
        o.modalonly = true;
        o.depends('auto_route', 'true');

        o = s.taboption('general', form.DynamicList, 'exclude_interface', _('Exclude Interface'),
            _('Conflicts with include_interface.'));
        o.modalonly = true;
        o.depends('auto_route', 'true');

        o = s.taboption('listenfields', form.Value, 'listen', _('Listen'));
        o.placeholder = '::'
        o.datatype = 'ipaddr';

        o = s.taboption('listenfields', form.Value, 'listen_port', _('Listen Port'));
        o.placeholder = '5353';
        o.datatype = 'port';

        o = s.taboption('listenfields', form.Flag, 'tcp_fast_open', _('TCP Fast Open'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends({ type: 'tun', "!reverse": true });

        o = s.taboption('listenfields', form.Flag, 'tcp_multi_path', _('TCP Multi Path'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends({ type: 'tun', "!reverse": true });

        o = s.taboption('listenfields', form.Flag, 'udp_fragment', _('UDP Fragment'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends({ type: 'tun', "!reverse": true });

        o = s.taboption('listenfields', form.Value, 'udp_timeout', _('UDP Timeout'));
        o.placeholder = '5m';
        o.modalonly = true;

        o = s.taboption('listenfields', form.Value, 'udp_timeout_stream', _('UDP Timeout Stream'));
        o.modalonly = true;

        o = s.taboption('listenfields', form.ListValue, 'detour', _('Detour'),
            _('connections will be forwarded to the specified inbound.'));
        o.modalonly = true;
        o.value('', _(''));
        songbox.updateOptions('inbound', o);

        // TLS
        o = s.taboption('general', form.Flag, 'tls_enabled', _('TLS'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('type', 'http');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'naive');
        o.depends('type', 'hysteria');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Value, 'tls_server_name', _('Server Name'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.DynamicList, 'tls_alpn', _('ALPN'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.ListValue, 'tls_min_version', _('Min Version'));
        o.value('1.0', 'TLS 1.0');
        o.value('1.1', 'TLS 1.1');
        o.value('1.2', 'TLS 1.2');
        o.value('1.3', 'TLS 1.3');
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.ListValue, 'tls_max_version', _('Max Version'));
        o.value('1.0', 'TLS 1.0');
        o.value('1.1', 'TLS 1.1');
        o.value('1.2', 'TLS 1.2');
        o.value('1.3', 'TLS 1.3');
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.MultiValue, 'tls_cipher_suites', _('Cipher Suites'));
        o.value('TLS_RSA_WITH_AES_128_CBC_SHA');
        o.value('TLS_RSA_WITH_AES_256_CBC_SHA');
        o.value('TLS_RSA_WITH_AES_128_GCM_SHA256');
        o.value('TLS_RSA_WITH_AES_256_GCM_SHA384');
        o.value('TLS_AES_128_GCM_SHA256');
        o.value('TLS_AES_256_GCM_SHA384');
        o.value('TLS_CHACHA20_POLY1305_SHA256');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA');
        o.value('TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA');
        o.value('TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384');
        o.value('TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256');
        o.value('TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384');
        o.value('TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256');
        o.value('TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256');
        o.modalonly = true;
        o.optional = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'tls_certificate', _('Certificate'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'tls_certificate_path', _('Certificate Path'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'tls_key', _('Key'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'tls_key_path', _('Key Path'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Flag, 'acme_enabled', _('Enabled ACME'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.DynamicList, 'acme_domain', _('Domain'), _('ACME will be disabled if empty.'));
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Value, 'acme_data_directory', _('Data Directory'),
            _('The directory to store ACME data.'));
        o.placeholder = '$HOME/.local/share/certmagic';
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Value, 'acme_default_server_name', _('Default Server Name'));
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Flag, 'acme_email', _('Email'),
            _('The email address to use when creating or selecting an existing ACME server account.'));
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.DummyValue, 'acme_provider', _('Provider'));
        o.value('letsencrypt', 'Let\'s Encrypt');
        o.value('zerossl', 'ZeroSSL');
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Flag, 'acme_disable_http_challenge', _('Disable HTTP Challenge'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Flag, 'acme_disable_tls_alpn_challenge', _('Disable TLS ALPN Challenge'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Value, 'acme_alternative_http_port', _('Alternative HTTP Port'));
        o.placeholder = '80';
        o.datatype = 'port';
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Value, 'acme_alternative_tls_port', _('Alternative TLS Port'));
        o.placeholder = '443';
        o.datatype = 'port';
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Flag, 'external_account', _('External Account'));
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.Value, 'acme_external_account_key_id', _('External Account Key ID'));
        o.modalonly = true;
        o.depends('external_account', '1');

        o = s.taboption('general', form.Value, 'acme_external_account_mac', _('External Account MAC'));
        o.modalonly = true;
        o.depends('external_account', '1');

        o = s.taboption('general', form.Flag, 'acme_dns01_challenge', _('DNS01 Challenge'));
        o.modalonly = true;
        o.depends('acme_enabled', '1');

        o = s.taboption('general', form.ListValue, 'dns01_provider', _('DNS01 Provider'));
        o.value('cloudflare', 'Cloudflare');
        o.value('alidns', 'AliDNS');
        o.modalonly = true;
        o.depends('acme_dns01_challenge', '1');

        o = s.taboption('general', form.Value, 'dns01_access_key_id', _('Access Key ID'));
        o.modalonly = true;
        o.depends('dns01_provider', 'alidns');

        o = s.taboption('general', form.Value, 'dns01_access_key_secret', _('Access Key Secret'));
        o.modalonly = true;
        o.depends('dns01_provider', 'alidns');

        o = s.taboption('general', form.Value, 'dns01_region_id', _('Region ID'));
        o.modalonly = true;
        o.depends('dns01_provider', 'alidns');

        o = s.taboption('general', form.Value, 'dns01_api_token', _('API Token'));
        o.modalonly = true;
        o.depends('dns01_provider', 'cloudflare');

        o = s.taboption('general', form.Flag, 'ech_enabled', _('Enable ECH'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Flag, 'ech_pq_signature_schemes_enabled', _('PQ Signature Schemes Enabled'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('ech_enabled', 'true');

        o = s.taboption('general', form.Flag, 'ech_dynamic_record_sizing_disabled', _('Dynamic Record Sizing Disabled'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.rmempty = false;
        o.depends('ech_enabled', 'true');

        o = s.taboption('general', form.Flag, 'reality_enabled', _('Enable Reality'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'reality_private_key', _('Public Key'));
        o.modalonly = true;
        o.rmempty = false;
        o.depends('reality_enabled', 'true');

        o = s.taboption('general', form.Value, 'reality_short_id', _('Short ID'),
            _('A hexadecimal string with zero to eight digits.'));
        o.modalonly = true;
        o.rmempty = false;
        o.depends('reality_enabled', 'true');

        o = s.taboption('general', form.Value, 'reality_max_time_difference', _('Max Time Difference'),
            _('The maximum time difference between the client and the server.'));
        o.placeholder = '5m';
        o.modalonly = true;
        o.depends('reality_enabled', 'true');

        // Multplex
        o = s.taboption('general', form.Flag, 'multiplex_enabled', _('Multiplex'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('type', 'shadowsocks');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'vless');

        o = s.taboption('general', form.Flag, 'multiplex_padding', _('Padding'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');
        
        // TCP Brutal
        o = s.taboption('general', form.Flag, 'tcp_brutal_enabled', _('TCP Brutal'),
            _('Enable TCP Brutal congestion control algorithm'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');
        
        o = s.taboption('general', form.Value, 'tcp_brutal_up_mbps', _('Up Mbps'), _('in Mbps.'));
        o.placeholder = '100';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('tcp_brutal_enabled', 'true');
    
        o = s.taboption('general', form.Value, 'tcp_brutal_down_mbps', _('Down Mbps'), _('in Mbps.'));
        o.placeholder = '100';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('tcp_brutal_enabled', 'true');

        // Transport
        o = s.taboption('general', form.ListValue, 'transport_type', _('Transport Type'));
        o.value('http', 'HTTP');
        o.value('ws', 'WebSocket');
        o.value('quic','QUIC');
        o.value('grpc', 'gRPC');
        o.value('httpupgrade', 'HTTP Upgrade');
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'vless');

        o = s.taboption('general', form.DynamicList, 'transport_host', _('Host'));
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'httpupgrade');

        o = s.taboption('general', form.Value, 'transport_path', _('Path'));
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'ws');
        o.depends('transport_type', 'httpupgrade');

        o = s.taboption('general', form.Value, 'transport_method', _('Method'));
        o.modalonly = true;
        o.depends('transport_type', 'http');

        o = s.taboption('general', form.Value, 'transport_header', _('Header'));
        o.placeholder = '{"Host": "www.gstatic.com"}';
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'ws');
        o.depends('transport_type', 'httpupgrade');

        o = s.taboption('general', form.Value, 'transport_idle_timeout', _('Idle Timeout'));
        o.placeholder = '15s';
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'grpc');

        o = s.taboption('general', form.Value, 'transport_ping_timeout', _('Ping Timeout'));
        o.placeholder = '15s';
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'grpc');

        o = s.taboption('general', form.Value, 'transport_max_early_data', _('Max Early Data'),
            _('Allowed payload size is in the request. Enabled if not zero.'));
        o.placeholder = '0';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('transport_type', 'ws');

        o = s.taboption('general', form.Value, 'transport_early_data_header_name', _('Early Data Header Name'));
        o.placeholder = 'Sec-WebSocket-Protocol';
        o.modalonly = true;
        o.depends('transport_type', 'ws');

        o = s.taboption('general', form.Value, 'transport_service_name', _('Service Name'));
        o.placeholder = 'TunService';
        o.modalonly = true;
        o.depends('transport_type', 'grpc');

        o = s.taboption('general', form.Flag, 'transport_permit_without_stream', _('Permit Without Stream'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('transport_type', 'grpc');

        // =============================================================
        // OutBound Setting
        s = m.section(form.GridSection, 'outbound', _('OutBound Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.tabbed = true;
        s.modaltitle = _('Add OutBound');

        s.tab('general', _('General Settings'));
        s.tab('dialfields', _('Dial Fields'));

        o = s.taboption('general', form.Flag, 'enabled', _('Enabled'));
        o.default = '1';
        o.rmempty = false;

        o = s.taboption('general', form.Value, 'tag', _('Tag'));
        o.placeholder = 'DIRECT';
        o.rmempty = false;

        o = s.taboption('general', form.ListValue, 'type', _('Type'));
        o.value('direct', _('Direct'));
        o.value('socks', _('Socks'));
        o.value('http', _('HTTP'));
        o.value('shadowsocks', _('Shadowsocks'));
        o.value('vmess', _('VMESS'));
        o.value('trojan', _('Trojan'));
        o.value('hysteria', _('Hysteria'));
        o.value('shadowtls', _('ShadowTLS'));
        o.value('vless', _('VLESS'));
        o.value('tuic', _('TUIC'));
        o.value('hysteria2', _('Hysteria2'));
        // o.value('tor', _('Tor'));
        // o.value('ssh', _('SSH'));
        o.value('selector', _('Selector'));
        o.value('urltest', _('URLTest'));

        o = s.taboption('general', form.Value, 'server', _('Server'));
        o.rmempty = false;
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'Shadowsocks');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'hysteria');
        o.depends('type', 'shadowtls');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Value, 'server_port', _('Server Port'));
        o.rmempty = false;
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'Shadowsocks');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'hysteria');
        o.depends('type', 'shadowtls');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Value, 'version', _('Version'));
        o.depends('type', 'socks');
        o.depends('type', 'shadowtls');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'username', _('Username'));
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'password', _('Password'));
        o.password = true;
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'shadowsocks');
        o.depends('type', 'trojan');
        o.depends('type', 'shadowtls');
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'network', _('Network'));
        o.value('tcp', _('TCP'));
        o.value('udp', _('UDP'));
        o.value('', _('TCP & UDP'));
        o.default = '';
        o.depends('type', 'socks');
        o.depends('type', 'shadowsocks');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'hysteria');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'path', _('Path'),
            _('Path of HTTP request.'));
        o.depends('type', 'http');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'headers', _('Headers'),
            _('HTTP request headers.'));
        o.depends('type', 'http');
        o.placeholder = '{"Host": "www.gstatic.com"}';
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'method', _('Method'));
        o.value('2022-blake3-aes-128-gcm', _('2022-blake3-aes-128-gcm'));
        o.value('2022-blake3-aes-256-gcm', _('2022-blake3-aes-256-gcm'));
        o.value('2022-blake3-chacha20-poly1305', _('2022-blake3-chacha20-poly1305'));
        o.value('none', _('None'));
        o.value('aes-128-gcm', _('AES-128-GCM'));
        o.value('aes-192-gcm', _('AES-192-GCM'));
        o.value('aes-256-gcm', _('AES-256-GCM'));
        o.value('chacha20-ietf-poly1305', _('Chacha20-IETF-Poly1305'));
        o.value('xchacha20-ietf-poly1305', _('XChacha20-IETF-Poly1305'));
        o.value('aes-128-ctr', _('AES-128-CTR'));
        o.value('aes-192-ctr', _('AES-192-CTR'));
        o.value('aes-256-ctr', _('AES-256-CTR'));
        o.value('aes-128-cfb', _('AES-128-CFB'));
        o.value('aes-192-cfb', _('AES-192-CFB'));
        o.value('aes-256-cfb', _('AES-256-CFB'));
        o.value('rc4-md5', _('RC4-MD5'));
        o.value('chacha20', _('Chacha20'));
        o.value('xcchacha20', _('Xcchacha20'));
        o.rmempty = false;
        o.depends('type', 'shadowsocks');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'plugin', _('Plugin'));
        o.value('obfs-local', _('Obfs-Local'));
        o.value('v2ray-plugin', _('V2Ray-Plugin'));
        o.modalonly = true;
        o.depends('type', 'shadowsocks');

        o = s.taboption('general', form.Value, 'plugin_opts', _('Plugin Opts'));
        o.modalonly = true;
        o.depends('type', 'shadowsocks');

        o = s.taboption('general', form.Value, 'uuid', _('UUID'));
        o.rmempty = false;
        o.depends('type', 'vmess');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'security', _('Security'));
        o.value('auto', _('Auto'));
        o.value('none', _('None'));
        o.value('zero', _('Zero'));
        o.value('aes-128-gcm', _('AES-128-GCM'));
        o.value('chacha20-poly1305', _('Chacha20-Poly1305'));
        o.value('aes-128-ctr', _('AES-128-CTR'));
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'alter_id', _('Alter ID'));
        o.value('0', '0');
        o.value('1', '1');
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.taboption('general', form.Flag, 'global_padding', _('Global Padding'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.taboption('general', form.Flag, 'authenticated_length', _('Authenticated Length'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'packet_encoding', _('Packet Encoding'),
            _('UDP packet encoding.'));
        o.value('', _(''));
        o.value('packetaddr');
        o.value('xudp');
        o.modalonly = true;
        o.depends('type', 'vmess');
        o.depends('type', 'vless');


        o = s.taboption('general', form.Value, 'up', _('Up'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100 Mbps'
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'down', _('Down'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100 Mbps'
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'up_mbps', _('Up Mbps'), _('in Mbps.'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100';
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'down_mbps', _('Down Mbps'), _('in Mbps.'));
        o.validate = songbox.validateBandwidth;
        o.placeholder = '100';
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'obfs', _('Obfs'), _('Obfuscated password.'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'obfs_type', _('QUIC traffic obfuscator type'),
            _('Only available with salamander.'));
        o.placeholder = 'salamander'
        o.depends('type', 'hysteria2');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'obfs_password', _('QUIC traffic obfuscator password.'));
        o.depends('type', 'hysteria2');
        o.modalonly = true;
        o.password = true;

        o = s.taboption('general', form.Flag, 'brutal_debug', _('Brutal Debug'),
            _('Enable debug information logging for Hysteria Brutal CC.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.rmempty = false;
        o.modalonly = true;
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Value, 'auth', _('Auth'), _('Authentication password, in base64.'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'auth_str', _('Auth Str'), _('Authentication password.'));
        o.depends('type', 'hysteria');
        o.password = true;
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'recv_window_conn', _('Recv Window Conn'),
            _('The QUIC stream-level flow control window for receiving data.'));
        o.datatype = 'uinteger';
        o.placeholder = '15728640';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'recv_window', _('Recv Window'),
            _('The QUIC connection-level flow control window for receiving data.'));
        o.datatype = 'uinteger';
        o.placeholder = '67108864';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.Flag, 'disable_mtu_discovery', _('Disable MTU Discovery'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'flow', _('Flow'));
        o.value('', _(''));
        o.value('xtls-rprx-vision', _('XTLS-RPRX-Vision'));
        o.depends('type', 'vless');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'congestion_control', _('Congestion Control'));
        o.value('cubic', _('Cubic'));
        o.value('new_reno', _('New Reno'));
        o.value('bbr', _('BBR'));
        o.default = 'cubic';
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.taboption('general', form.ListValue, 'udp_relay_mode', _('UDP Relay Mode'));
        o.value('nativ', _('Native'));
        o.value('quic', _('QUIC'));
        o.default = 'native';
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.taboption('general', form.Flag, 'udp_over_stream', _('UDP Over Stream'),
            _('This mode has no positive effect in a proper UDP proxy scenario and should only be applied to relay streaming UDP traffic (basically QUIC streams).'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('type', 'tuic');

        o = s.taboption('general', form.MultiValue, 'outbounds', _('Outbounds'), _('List of outbound tags to select.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);
        o.rmempty = false;
        o.depends('type', 'selector');
        o.depends('type', 'urltest');

        o = s.taboption('general', form.ListValue, 'default', _('Default'), _('The default outbound tag. The first outbound will be used if empty.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);
        o.depends('type', 'selector');
        o.modalonly = true;

        o = s.taboption('general', form.Flag, 'interrupt_exist_connections', _('Interrupt Exist Connections'),
            _('Interrupt existing connections when the selected outbound has changed.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.depends('type', 'selector');
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'url', _('URL'), _('URL to test.'));
        o.placeholder = 'http://www.gstatic.com/generate_204';
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'interval', _('Interval'), _('Interval to test.'));
        o.placeholder = '3m';
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'tolerance', _('Tolerance'), _('The test tolerance in milliseconds.'));
        o.placeholder = '50';
        o.datatype = 'uinteger';
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.taboption('general', form.Value, 'idle_timeout', _('Idle Timeout'), _('Idle timeout.'));
        o.placeholder = '30m';
        o.depends('type', 'urltest');
        o.modalonly = true;

        // UDP over TCP
        o = s.taboption('general', form.Flag, 'udp_over_tcp_enabled', _('UDP over TCP'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('type', 'socks');
        o.depends('type', 'shadowsocks');

        o = s.taboption('general', form.ListValue, 'udp_over_tcp_version', _('Version'));
        o.value('2', '2');
        o.value('1', '1');
        o.default = '2';
        o.modalonly = true;
        o.depends('udp_over_tcp_enabled', 'true');

        // Multplex
        o = s.taboption('general', form.Flag, 'multiplex_enabled', _('Multiplex'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('type', 'shadowsocks');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'vless');

        o = s.taboption('general', form.ListValue, 'multiplex_protocol', _('Protocol'));
        o.value('smux', 'SMUX');
        o.value('yamux', 'YAMUX');
        o.value('h2mux', 'H2MUX');
        o.default = 'h2mux';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');

        o = s.taboption('general', form.Value, 'multiplex_max_connections', _('Max Connections'), _('Conflicts with multiplex_max_streams.'));
        o.placeholder = '4';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');

        o = s.taboption('general', form.Value, 'multiplex_min_streams', _('Min Streams'), _('Conflicts with multiplex_max_streams.'));
        o.placeholder = '4';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');

        o = s.taboption('general', form.Value, 'multiplex_max_streams', _('Max Streams'), _('Conflicts with multiplex_min_streams and multiplex_max_connections.'));
        o.placeholder = '0';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');

        o = s.taboption('general', form.Flag, 'multiplex_padding', _('Padding'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');
        
        // TCP Brutal
        o = s.taboption('general', form.Flag, 'tcp_brutal_enabled', _('TCP Brutal'),
            _('Enable TCP Brutal congestion control algorithm'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('multiplex_enabled', 'true');
        
        o = s.taboption('general', form.Value, 'tcp_brutal_up_mbps', _('Up Mbps'), _('in Mbps.'));
        o.placeholder = '100';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('tcp_brutal_enabled', 'true');
    
        o = s.taboption('general', form.Value, 'tcp_brutal_down_mbps', _('Down Mbps'), _('in Mbps.'));
        o.placeholder = '100';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('tcp_brutal_enabled', 'true');

        // TLS
        o = s.taboption('general', form.Flag, 'tls_enabled', _('TLS'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('type', 'http');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'hysteria');
        o.depends('type', 'shadowtls');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.depends('type', 'hysteria2');

        o = s.taboption('general', form.Value, 'tls_disable_sni', _('Disable SNI'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'tls_server_name', _('Server Name'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Flag, 'tls_insecure', _('Insecure'),
            _('Accepts any server certificate.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.DynamicList, 'tls_alpn', _('ALPN'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.ListValue, 'tls_min_version', _('Min Version'));
        o.value('1.0', 'TLS 1.0');
        o.value('1.1', 'TLS 1.1');
        o.value('1.2', 'TLS 1.2');
        o.value('1.3', 'TLS 1.3');
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.ListValue, 'tls_max_version', _('Max Version'));
        o.value('1.0', 'TLS 1.0');
        o.value('1.1', 'TLS 1.1');
        o.value('1.2', 'TLS 1.2');
        o.value('1.3', 'TLS 1.3');
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.MultiValue, 'tls_cipher_suites', _('Cipher Suites'));
        o.value('TLS_RSA_WITH_AES_128_CBC_SHA');
        o.value('TLS_RSA_WITH_AES_256_CBC_SHA');
        o.value('TLS_RSA_WITH_AES_128_GCM_SHA256');
        o.value('TLS_RSA_WITH_AES_256_GCM_SHA384');
        o.value('TLS_AES_128_GCM_SHA256');
        o.value('TLS_AES_256_GCM_SHA384');
        o.value('TLS_CHACHA20_POLY1305_SHA256');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA');
        o.value('TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA');
        o.value('TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256');
        o.value('TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384');
        o.value('TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256');
        o.value('TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384');
        o.value('TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256');
        o.value('TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256');
        o.modalonly = true;
        o.optional = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'tls_certificate', _('Certificate'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'tls_certificate_path', _('Certificate Path'));
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Flag, 'ech_enabled', _('Enable ECH'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Flag, 'ech_pq_signature_schemes_enabled', _('PQ Signature Schemes Enabled'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.depends('ech_enabled', 'true');

        o = s.taboption('general', form.Flag, 'ech_dynamic_record_sizing_disabled', _('Dynamic Record Sizing Disabled'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        o.rmempty = false;
        o.depends('ech_enabled', 'true');

        o = s.taboption('general', form.Flag, 'utls_enabled', _('Enable UTLS'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.ListValue, 'utls_fingerprint', _('Fingerprint'));
        o.value('chrome', 'Chrome');
        o.value('firefox', 'Firefox');
        o.value('safari', 'Safari');
        o.value('360');
        o.value('qq', 'QQ');
        o.value('ios', 'iOS');
        o.value('android', 'Android');
        o.value('random', 'Random');
        o.value('randomized', 'Randomized');
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;
        o.depends('utls_enabled', 'true');

        o = s.taboption('general', form.Flag, 'reality_enabled', _('Enable Reality'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('tls_enabled', 'true');

        o = s.taboption('general', form.Value, 'reality_public_key', _('Public Key'));
        o.modalonly = true;
        o.rmempty = false;
        o.depends('reality_enabled', 'true');

        o = s.taboption('general', form.Value, 'reality_short_id', _('Short ID'),
            _('A hexadecimal string with zero to eight digits.'));
        o.modalonly = true;
        o.rmempty = false;
        o.depends('reality_enabled', 'true');

        // Transport
        o = s.taboption('general', form.ListValue, 'transport_type', _('Transport Type'));
        o.value('http', 'HTTP');
        o.value('ws', 'WebSocket');
        o.value('quic','QUIC');
        o.value('grpc', 'gRPC');
        o.value('httpupgrade', 'HTTP Upgrade');
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'vless');

        o = s.taboption('general', form.DynamicList, 'transport_host', _('Host'));
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'httpupgrade');

        o = s.taboption('general', form.Value, 'transport_path', _('Path'));
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'ws');
        o.depends('transport_type', 'httpupgrade');

        o = s.taboption('general', form.Value, 'transport_method', _('Method'));
        o.modalonly = true;
        o.depends('transport_type', 'http');

        o = s.taboption('general', form.Value, 'transport_header', _('Header'));
        o.placeholder = '{"Host": "www.gstatic.com"}';
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'ws');
        o.depends('transport_type', 'httpupgrade');

        o = s.taboption('general', form.Value, 'transport_idle_timeout', _('Idle Timeout'));
        o.placeholder = '15s';
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'grpc');

        o = s.taboption('general', form.Value, 'transport_ping_timeout', _('Ping Timeout'));
        o.placeholder = '15s';
        o.modalonly = true;
        o.depends('transport_type', 'http');
        o.depends('transport_type', 'grpc');

        o = s.taboption('general', form.Value, 'transport_max_early_data', _('Max Early Data'),
            _('Allowed payload size is in the request. Enabled if not zero.'));
        o.placeholder = '0';
        o.datatype = 'uinteger';
        o.modalonly = true;
        o.depends('transport_type', 'ws');

        o = s.taboption('general', form.Value, 'transport_early_data_header_name', _('Early Data Header Name'));
        o.placeholder = 'Sec-WebSocket-Protocol';
        o.modalonly = true;
        o.depends('transport_type', 'ws');

        o = s.taboption('general', form.Value, 'transport_service_name', _('Service Name'));
        o.placeholder = 'TunService';
        o.modalonly = true;
        o.depends('transport_type', 'grpc');

        o = s.taboption('general', form.Flag, 'transport_permit_without_stream', _('Permit Without Stream'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.modalonly = true;
        o.depends('transport_type', 'grpc');

        o = s.taboption('dialfields', form.ListValue, 'detour', _('Detour'),
            _('If enabled, all other fields will be ignored.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);
        o.modalonly = true;

        o = s.taboption('dialfields', widgets.NetworkSelect, 'bind_address', _('Bind Address'));
        o.modalonly = true;

        o = s.taboption('dialfields', form.Value, 'inet4_bind_address', _('IPv4 Bind Address'));
        o.datatype = 'ip4addr';
        o.placeholder = '0.0.0.0'
        o.modalonly = true;

        o = s.taboption('dialfields', form.Value, 'inet6_bind_address', _('IPv6 Bind Address'));
        o.datatype = 'ip6addr';
        o.placeholder = '::';
        o.modalonly = true;

        o = s.taboption('dialfields', form.Value, 'routing_mark', _('Routing Mark'),
            _('Set netfilter routing mark.'));
        o.placeholder = '1234';
        o.modalonly = true;

        o = s.taboption('dialfields', form.Flag, 'reuse_addr', _('Reuse Addr'),
            _('Reuse listener address.'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;

        o = s.taboption('dialfields', form.Flag, 'tcp_fast_open', _('Enable TCP Fast Open'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;

        o = s.taboption('dialfields', form.Flag, 'tcp_multi_path', _('Enable TCP Multi Path'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;
        
        o = s.taboption('dialfields', form.Flag, 'udp_fragment', _('Enable UDP Fragment'));
        o.enabled = 'true';
        o.disabled = 'false';
        o.default = 'false';
        o.modalonly = true;

        o = s.taboption('dialfields', form.Value, 'connect_timeout', _('Connect Timeout'));
        o.placeholder = '5s';
        o.modalonly = true;

        o = s.taboption('dialfields', form.ListValue, 'domain_strategy', _('Domain Strategy'));
        o.value('prefer_ipv4', _('Prefer IPv4'));
        o.value('prefer_ipv6', _('Prefer IPv6'));
        o.value('ipv4_only', _('IPv4 Only'));
        o.value('ipv6_only', _('IPv6 Only'));
        o.value('', _(''));
        o.default = '';
        o.modalonly = true;

        return m.render();
    }
});