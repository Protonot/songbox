'use strict';
'require uci';
'require form';
'require view';
'require ui';
'require fs';
'require songbox';

function render_UDPoverTCP(section) {
    var s = section, o;
    s.sortable = true;
    s.tabbed = true;
    s.modaltitle = _('Add UDP over TCP');
    // s.cfgsections = tag;

    o = s.option(form.Flag, 'enabled', _('Enabled'));
    o.enabled = 'true';
    o.disabled = 'false';

    o = s.option(form.ListValue, 'version', _('Version'));
    o.value('2', '2');
    o.value('1', '1');
    o.default = '2';
}

return view.extend({
    load: function() {
        return fs.read('/var/etc/songbox/other/vmess_users.json').then(function(content) {
            return content;
        }).catch(function() {
            return '{}';
        });
    },
    render: function(content) {
        var m, s, o, ss, so;

        m = new form.Map('songbox', _('SongBox Bound'), _('Based on Sing-box, a universal proxy platform'));

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
        // o.value('vmess', _('VMESS'));
        // o.value('trojan', _('Trojan'));
        // o.value('naive', _('Naive'));
        // o.value('hysteria', _('Hysteria'));
        // o.value('shadowtls', _('ShadowTLS'));
        // o.value('vless', _('VLESS'));
        // o.value('tuic', _('TUIC'));
        // o.value('hysteria2', _('Hysteria2'));
        o.value('tun', _('Tun'));
        o.value('redirect', _('Redirect'));
        o.value('tproxy', _('TProxy'));
        o.rmempty = false;

        o = s.taboption('general', form.ListValue, 'network', _('Network'));
        o.value('tcp', _('TCP'));
        o.value('udp', _('UDP'));
        o.value('', _('TCP & UDP'));
        o.default = '';
        o.depends('type', 'direct');
        o.depends('type', 'socks');
        o.depends('type', 'tproxy');
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
        o.depends('type', 'socks');

        o = s.taboption('general', form.Value, 'password', _('Password'));
        o.password = true;
        o.rmempty = false;
        o.modalonly = true;
        o.depends('type', 'socks');

        // o = s.taboption('general', form.TextValue, 'users', _('Users'));
        // o.rows = 20;
        // o.monospace = true;
        // o.default = content;
        // o.rmempty = false;
        // o.depends('type', 'vmess');
        // o.depends('type', 'torjan');

        // o = s.taboption('general', form.Button, '_add_user', _('Add User'));
        // o.inputtitle = _('Save');
        // o.inputstyle = 'add';
        // o.onclick = function() {
        //     var jsonContent = document.querySelector('textarea[name="cbid.songbox.inbound.users"]').value;
        //     try {
        //         var users = JSON.parse(jsonContent);
        //         fs.write('/var/etc/songbox/other/vmess_users.json', JSON.stringify(users, null, 2)).then(function() {
        //             ui.addNotification(null, _('User added successfully'));
        //         }.catch(function(e) {
        //             ui.addNotification(null, _('Failed to add user: %s').format(e));
        //         }));
        //     } catch (e) {
        //         ui.addNotification(null, _('Failed to add user: %s').format(e));
        //     }
        // }; 
        // o.depends('type', 'vmess');
        // o.depends('type', 'torjan');
        // o.depends('type', 'naive');

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

        o = s.taboption('general', form.Value, 'udp_timeout', _('UDP Timeout'), _('UDP NAT expiration time.'));
        o.placeholder = '5m';
        o.modalonly = true;
        o.depends('type', 'tun');

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

        // =============================================================
        // OutBound Setting
        s = m.section(form.GridSection, 'outbound', _('OutBound Setting'));
        s.anonymous = true;
        s.addremove = true;
        s.sortable = true;
        s.tabbed = true;
        s.modaltitle = _('Add OutBound');

        o = s.option(form.Flag, 'enabled', _('Enabled'));
        o.default = '1';
        o.rmempty = false;

        o = s.option(form.Value, 'tag', _('Tag'));
        o.placeholder = 'DIRECT';
        o.rmempty = false;

        o = s.option(form.ListValue, 'type', _('Type'));
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
        // o.value('hysteria2', _('Hysteria2'));
        // o.value('tor', _('Tor'));
        // o.value('ssh', _('SSH'));
        o.value('selector', _('Selector'));
        o.value('urltest', _('URLTest'));

        o = s.option(form.Value, 'server', _('Server'));
        o.rmempty = false;
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'hysteria');
        o.depends('type', 'shadowtls');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');

        o = s.option(form.Value, 'server_port', _('Server Port'));
        o.rmempty = false;
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'vmess');
        o.depends('type', 'trojan');
        o.depends('type', 'hysteria');
        o.depends('type', 'shadowtls');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');

        o = s.option(form.Value, 'version', _('Version'));
        o.depends('type', 'socks');
        o.depends('type', 'shadowtls');
        o.modalonly = true;

        o = s.option(form.Value, 'username', _('Username'));
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.modalonly = true;

        o = s.option(form.Value, 'password', _('Password'));
        o.password = true;
        o.depends('type', 'socks');
        o.depends('type', 'http');
        o.depends('type', 'shadowsocks');
        o.depends('type', 'trojan');
        o.depends('type', 'shadowtls');
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.option(form.ListValue, 'network', _('Network'));
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
        o.modalonly = true;

        o = s.option(form.Value, 'path', _('Path'));
        o.depends('type', 'http');
        o.modalonly = true;

        o = s.option(form.ListValue, 'method', _('Method'));
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

        o = s.option(form.Value, 'uuid', _('UUID'));
        o.rmempty = false;
        o.depends('type', 'vmess');
        o.depends('type', 'vless');
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.option(form.ListValue, 'security', _('Security'));
        o.value('auto', _('Auto'));
        o.value('none', _('None'));
        o.value('zero', _('Zero'));
        o.value('aes-128-gcm', _('AES-128-GCM'));
        o.value('chacha20-poly1305', _('Chacha20-Poly1305'));
        o.value('aes-128-ctr', _('AES-128-CTR'));
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.option(form.ListValue, 'alter_id', _('Alter ID'));
        o.value('0', '0');
        o.value('1', '1');
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.option(form.ListValue, 'global_padding', _('Global Padding'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.option(form.ListValue, 'authenticated_length', _('Authenticated Length'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.depends('type', 'vmess');
        o.modalonly = true;

        o = s.option(form.Value, 'up', _('Up'));
        o.validate = songbox.validateBandwidth;
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'down', _('Down'));
        o.validate = songbox.validateBandwidth;
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'up_mbps', _('Up Mbps'), _('in Mbps.'));
        o.validate = songbox.validateBandwidth;
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'down_mbps', _('Down Mbps'), _('in Mbps.'));
        o.validate = songbox.validateBandwidth;
        o.rmempty = false;
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'obfs', _('Obfs'), _('Obfuscated password.'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'auth', _('Auth'), _('Authentication password, in base64.'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'auth_str', _('Auth Str'), _('Authentication password.'));
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'recv_window_conn', _('Recv Window Conn'),
            _('The QUIC stream-level flow control window for receiving data.'));
        o.datatype = 'uinteger';
        o.placeholder = '15728640';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.Value, 'recv_window', _('Recv Window'),
            _('The QUIC connection-level flow control window for receiving data.'));
        o.datatype = 'uinteger';
        o.placeholder = '67108864';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.ListValue, 'disable_mtu_discovery', _('Disable MTU Discovery'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.depends('type', 'hysteria');
        o.modalonly = true;

        o = s.option(form.ListValue, 'flow', _('Flow'));
        o.value('', _(''));
        o.value('xtls-rprx-vision', _('XTLS-RPRX-Vision'));
        o.depends('type', 'vless');
        o.modalonly = true;

        o = s.option(form.ListValue, 'congestion_control', _('Congestion Control'));
        o.value('cubic', _('Cubic'));
        o.value('new_reno', _('New Reno'));
        o.value('bbr', _('BBR'));
        o.default = 'cubic';
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.option(form.ListValue, 'udp_relay_mode', _('UDP Relay Mode'));
        o.value('nativ', _('Native'));
        o.value('quic', _('QUIC'));
        o.default = 'native';
        o.depends('type', 'tuic');
        o.modalonly = true;

        o = s.option(form.MultiValue, 'outbounds', _('Outbounds'), _('List of outbound tags to select.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);
        o.rmempty = false;
        o.depends('type', 'selector');
        o.depends('type', 'urltest');

        o = s.option(form.ListValue, 'default', _('Default'), _('The default outbound tag. The first outbound will be used if empty.'));
        o.value('', _(''));
        songbox.updateOptions('outbound', o);
        o.depends('type', 'selector');
        o.modalonly = true;

        o = s.option(form.ListValue, 'interrupt_exist_connections', _('Interrupt Exist Connections'),
            _('Interrupt existing connections when the selected outbound has changed.'));
        o.value('false', _('False'));
        o.value('true', _('True'));
        o.value('', _(''));
        o.default = '';
        o.depends('type', 'selector');
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.option(form.Value, 'url', _('URL'), _('URL to test.'));
        o.placeholder = 'http://www.gstatic.com/generate_204';
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.option(form.Value, 'interval', _('Interval'), _('Interval to test.'));
        o.placeholder = '3m';
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.option(form.Value, 'tolerance', _('Tolerance'), _('The test tolerance in milliseconds.'));
        o.placeholder = '50';
        o.datatype = 'uinteger';
        o.depends('type', 'urltest');
        o.modalonly = true;

        o = s.option(form.Value, 'idle_timeout', _('Idle Timeout'), _('Idle timeout.'));
        o.placeholder = '30m';
        o.depends('type', 'urltest');
        o.modalonly = true;

        return m.render();
    }
});