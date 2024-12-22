#!/usr/bin/ucode

import { cursor } from 'uci';
import { readlink, popen, writefile, mkdir, access } from 'fs';
import { isnan } from 'math';

const uci = cursor();

let config = {outbounds: [], inbounds: []};

function mixedType(value) {
    let newValues = [];
    for (let key in value) {
        let num = int(key);
        if (isnan(num)) {
            push(newValues, key);
        } else {
            push(newValues, num);
        }
    }
    return newValues;
}

function regexOutbounds(regex) {
    let newOutbounds = [];
    uci.foreach('songbox', 'outbound', outbound => {
        if (outbound.enabled != "1") return;
        if (match(outbound.tag, regex)) {
            push(newOutbounds, outbound.tag);
        }
    });
    return newOutbounds;
}

function addUrl(url) {
    if (match(url, /^geoip/)) {
        url = "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/" + url + ".srs";
    }
    else if (match(url, /^geosite/)) {
        url = "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/" + url + ".srs";
    }
    else
        url = "https://raw.githubusercontent.com/Protonot/luci-app-songbox/rule-set/" + url + ".srs";
    return url;
}

function deepClean(obj) {
    if (type(obj) == "object") {
        for (let key in obj) {
            if (obj[key] == null || obj[key] == "" || type(obj[key]) == "void") {
                delete obj[key];
            } else if (type(obj[key]) == "object" || type(obj[key]) == "array") {
                deepClean(obj[key]);
                if ((type(obj[key]) == "object" && length(keys(obj[key])) == 0) ||
                    (type(obj[key]) == "array" && length(obj[key]) == 0)) {
                    delete obj[key];
                }
            }
        }
    } else if (type(obj) == "array") {
        for (let i = length(obj) - 1; i >= 0; i--) {
            if (obj[i] == null || obj[i] == "" || type(obj[i]) == "void") {
                splice(obj, i, 1);
            } else if (type(obj[i]) == "object" || type(obj[i]) == "array") {
                deepClean(obj[i]);
                if ((type(obj[i]) == "object" && length(keys(obj[i])) == 0) ||
                    (type(obj[i]) == "array" && length(obj[i]) == 0)) {
                    splice(obj, i, 1);
                }
            }
        }
    }
    return obj;
}

let log = uci.get_all("songbox", "log");
config["log"] = {
    "disabled": (log.disabled == "true"),
    "level": log.level,
    "output": log.output,
    "timestamp": (log.timestamp == "true")
};

let experimental = uci.get_all("songbox", "experimental");
config["experimental"] = {
    "cache_file": {
        "enabled": (experimental.enabled == "true"),
        "path": log.path,
        "cache_id": experimental.cache_id,
        "store_fakeip": (experimental.store_fakeip == "true"),
        "store_rdrc": (experimental.store_rdrc == "true"),
        "rdrc_timeout": experimental.rdrc_timeout
    },
    "clash_api": {
        "external_controller": experimental.external_controller,
        "external_ui": experimental.external_ui,
        "external_ui_download_url": experimental.external_ui_download_url,
        "external_ui_download_detour": experimental.external_ui_download_detour
    }
};

let ntp = uci.get_all("songbox", "ntp");
config["ntp"] = {
      "enabled": (ntp.enabled == "true"),
      "server": ntp.server,
      "server_port": int(ntp.server_port),
      "interval": ntp.interval,
};

let dns_advanced = uci.get_all("songbox", "dns_advanced");
config["dns"]= {
    "servers": [],
    "rules": [],
    "final": dns_advanced.final,
    "strategy": dns_advanced.strategy,
    "disable_cache": (dns_advanced.disable_cache == "true"),
    "disable_expire": (dns_advanced.disable_expire == "true"),
    "independent_cache": (dns_advanced.independent_cache == "true"),
    "cache_capacity": int(dns_advanced.cache_capacity),
    "reverse_mapping": (dns_advanced.reverse_mapping == "true"),
    "client_subnet": dns_advanced.client_subnet,
    "fakeip": {}
};

let dns_fakeip = uci.get_all("songbox", "dns_fakeip");
config["dns"]["fakeip"] = {
    "enabled": (dns_fakeip.enabled == "true"),
    "inet4_range": dns_fakeip.inet4_range,
    "inet6_range": dns_fakeip.inet6_range
};

uci.foreach('songbox', 'dns_server', dns => {
    if (dns.enabled != "1") return;

    push(config["dns"]["servers"], {
        "tag": dns.tag,
        "address": dns.address,
        "address_resolver": dns.address_resolver,
        "address_strategy": dns.address_strategy,
        "strategy": dns.strategy,
        "detour": dns.detour,
        "client_subnet": dns.client_subnet,
    });
});

uci.foreach('songbox', 'dns_rules', rule => {
    if (rule.enabled != "1") return;

    push(config["dns"]["rules"], {
        "inbound": rule.inbound,
        "ip_version": (rule.ip_version == null) ? null : int(rule.ip_version),
        "query_type": mixedType(rule.query_type),
        "network": rule.network,
        "protocol": rule.protocol,
        "domain": rule.domain,
        "domain_suffix": rule.domain_suffix,
        "domain_keyword": rule.domain_keyword,
        "domain_regex": rule.domain_regex,
        "source_ip_cidr": rule.source_ip_cidr,
        "source_ip_is_private": (rule.source_ip_is_private == "true"),
        "ip_cidr": rule.ip_cidr,
        "ip_is_private": (rule.ip_is_private == "true"),
        "source_port": int(rule.source_port),
        "source_port_range": rule.source_port_range,
        "port": (rule.port == null) ? null : int(rule.port),
        "port_range": rule.port_range,
        "clash_mode": rule.clash_mode,
        "rule_set": rule.rule_set,
        "rule_set_ip_cidr_accept_empty": (rule.rule_set_ip_cidr_accept_empty == "true"),
        "invert": (rule.invert == "true"),
        "outbound": rule.outbound,
        "action": rule.action,
        "server": rule.server,
        "disable_cache": (rule.disable_cache == "true"),
        "rewrite_ttl": (rule.rewrite_ttl == null) ? null : int(rule.rewrite_ttl),
        "client_subnet": null,
        "method": rule.method,
        "no_drop": (rule.no_drop == "true"),
      });
});

let route_advanced = uci.get_all("songbox", "route_advanced");
config["route"] = {
    "rules": [],
    "rule_set": [],
    "final": route_advanced.final,
    "auto_detect_interface": (route_advanced.auto_detect_interface == "true"),
    "default_interface": route_advanced.default_interface,
    "default_mark": int(route_advanced.default_mark),
};

uci.foreach('songbox', 'route_rules', rule => {
    if (rule.enabled != "1") return;

    push(config["route"]["rules"], {
        "inbound": rule.inbound,
        "ip_version": (rule.ip_version == null) ? null : int(rule.ip_version),
        "network": rule.network,
        "protocol": rule.protocol,
        "client": rule.client,
        "domain": rule.domain,
        "domain_suffix": rule.domain_suffix,
        "domain_keyword": rule.domain_keyword,
        "domain_regex": rule.domain_regex,
        "source_ip_cidr": rule.source_ip_cidr,
        "source_ip_is_private": (rule.source_ip_is_private == "true"),
        "ip_cidr": rule.ip_cidr,
        "ip_is_private": (rule.ip_is_private == "true"),
        "source_port": (rule.source_port == null) ? null : int(rule.source_port),
        "source_port_range": rule.source_port_range,
        "port": (rule.port == null) ? null : int(rule.port),
        "port_range": rule.port_range,
        "clash_mode": rule.clash_mode,
        "rule_set": rule.rule_set,
        "invert": (rule.invert == "true"),
        "action": rule.action,
        "outbound": rule.outbound,
        "override_address": rule.override_address,
        "override_port": (rule.override_port == null) ? null : int(rule.override_port),
        "udp_disable_domain_unmapping": (rule.udp_disable_domain_unmapping == "true"),
        "udp_connect": (rule.udp_connect == "true"),
        "udp_timeout": rule.udp_timeout,
        "method": rule.method,
        "no_drop": (rule.no_drop == "true"),
        "sniffer": rule.sniffer,
        "timeout": rule.timeout,
        "strategy": rule.strategy,
        "server": rule.server,
    });
});

uci.foreach('songbox', 'global_rule_sets', rule_set => {
    push(config["route"]["rule_set"], {
        "type": rule_set.type,
        "tag": rule_set.tag,
        "format": rule_set.format,
        "url": (rule_set.url == null) ? addUrl(rule_set.tag): rule_set.url,
        "download_detour": rule_set.download_detour,
        "update_interval": rule_set.update_interval,
        "path": rule_set.path,
    });
});

uci.foreach('songbox', 'outbound', outbound => {
    if (outbound.enabled != "1") return;

    push(config["outbounds"], {
        "type": outbound.type,
        "tag": outbound.tag,
        "server": outbound.server,
        "server_port": (outbound.server_port == null) ? null : int(outbound.server_port),
        "version": (outbound.version == null) ? null : (outbound.type == "socks") ? outbound.version : int(outbound.version),
        "username": outbound.username,
        "password": outbound.password,
        "network": outbound.network,
        "path": outbound.path,
        "header": outbound.header,
        "method": outbound.method,
        "plugin": outbound.plugin,
        "plugin_opts": outbound.plugin_opts,
        "uuid": outbound.uuid,
        "security": outbound.security,
        "alter_id": (outbound.alter_id == null) ? null : int(outbound.alter_id),
        "global_padding": (outbound.global_padding == "true"),
        "authenticated_length": (outbound.authenticated_length == "true"),
        "packet_encoding": outbound.packet_encoding,
        "up": outbound.up,
        "up_mbps": (outbound.up_mbps == null) ? null : int(outbound.up_mbps),
        "down": outbound.down,
        "down_mbps": (outbound.down_mbps == null) ? null : int(outbound.down_mbps),
        "obfs": outbound.obfs,
        "auth": outbound.auth,
        "auth_str": outbound.auth_str,
        "recv_window_conn": (outbound.recv_window_conn == null) ? null : int(outbound.recv_window_conn),
        "recv_window": (outbound.recv_window == null) ? null : int(outbound.recv_window),
        "disable_mtu_discovery": (outbound.disable_mtu_discovery == "true"),
        "flow": outbound.flow,
        "congestion_control": outbound.congestion_control,
        "udp_relay_mode": outbound.udp_relay_mode,
        "udp_over_stream": (outbound.udp_over_stream == "true"),
        "obfs": {
            "type": outbound.obfs_type,
            "password": outbound.obfs_password,
        },
        "brutal_debug": (outbound.brutal_debug == "true"),
        "outbounds": (outbound.regex_enabled == "1") ? regexOutbounds(outbound.outbounds) : outbound.outbounds,
        "default": outbound.default,
        "interrupt_exist_connections": (outbound.interrupt_exist_connections == "true"),
        "url": outbound.url,
        "interval": outbound.interval,
        "tolerance": outbound.tolerance,
        "idle_timeout": outbound.idle_timeout,
        "udp_over_tcp": (outbound.udp_over_tcp_enabled == "true")? {
            "enabled": true,
            "version": (outbound.udp_over_tcp_version == null) ? null : int(outbound.udp_over_tcp_version),
        }: false,
        "tls": {
            "enabled": (outbound.tls_enabled == "true"),
            "disable_sni": (outbound.tls_disable_sni == "true"),
            "server_name": outbound.tls_server_name,
            "insecure": (outbound.tls_insecure == "true"),
            "alpn": outbound.tls_alpn,
            "min_version": outbound.tls_min_version,
            "max_version": outbound.tls_max_version,
            "cipher_suites": outbound.tls_cipher_suites,
            "certificate": outbound.tls_certificate,
            "certificate_path": outbound.tls_certificate_path,
            "ech": {
                "enabled": (outbound.ech_enabled == "true"),
                "pq_signature_schemes_enabled": (outbound.ech_pq_signature_schemes_enabled == "true"),
                "dynamic_record_sizing_disabled": (outbound.ech_dynamic_record_sizing_disabled == "true"),
                "config": outbound.ech_config,
                "config_path": outbound.ech_config_path,
            },
            "utls": {
                "enabled": (outbound.utls_enabled == "true"),
                "fingerprint": outbound.utls_fingerprint,
            },
            "reality": {
                "enabled": (outbound.reality_enabled == "true"),
                "public_key": outbound.reality_public_key,
                "short_id": outbound.reality_short_id,
            }
        },
        "multiplex": {
            "enabled": (outbound.multiplex_enabled == "true"),
            "protocol": outbound.multiplex_protocol,
            "max_connections": (outbound.multiplex_max_connections == null) ? null : int(outbound.multiplex_max_connections),
            "min_streams": (outbound.multiplex_min_streams == null) ? null : int(outbound.multiplex_min_streams),
            "max_streams": (outbound.multiplex_max_streams == null) ? null : int(outbound.multiplex_max_streams),
            "padding": (outbound.multiplex_padding == "true"),
            "brutal": {
                "enabled": (outbound.tcp_brutal_enabled == "true"),
                "up_mbps": (outbound.tcp_brutal_up_mbps == null) ? null : int(outbound.tcp_brutal_up_mbps),
                "down_mbps": (outbound.tcp_brutal_down_mbps == null) ? null : int(outbound.tcp_brutal_down_mbps),
            }
        },
        "transport": {
            "type": outbound.transport_type,
            "host": outbound.transport_host,
            "path": outbound.transport_path,
            "method": outbound.transport_method,
            "headers": outbound.transport_headers,
            "idle_timeout": outbound.transport_idle_timeout,
            "ping_timeout": outbound.transport_ping_timeout,
            "max_early_data": (outbound.transport_max_early_data == null) ? null : int(outbound.transport_max_early_data),
            "early_data_header_name": outbound.transport_early_data_header_name,
            "service_name": outbound.transport_service_name,
            "permit_without_stream": (outbound.transport_permit_without_stream == "true"),
        },
        "detour": outbound.detour,
        "bind_interface": outbound.bind_interface,
        "inet4_bind_address": outbound.inet4_bind_address,
        "inet6_bind_address": outbound.inet6_bind_address,
        "routing_mark": (outbound.routing_mark == null) ? null : int(outbound.routing_mark),
        "reuse_addr": (outbound.reuse_addr == "true"),
        "connect_timeout": outbound.connect_timeout,
        "tcp_fast_open": (outbound.tcp_fast_open == "true"),
        "tcp_multi_path": (outbound.tcp_multi_path == "true"),
        "udp_fragment": (outbound.udp_fragment == "true"),
        "domain_strategy": outbound.domain_strategy,
    });
});

uci.foreach('songbox', 'inbound', inbound => {
    if (inbound.enabled != "1") return;
    if (inbound.type == "tun") {
        push(config["inbounds"], {
            "type": "tun",
            "tag": inbound.tag,
            "interface_name": inbound.interface_name,
            "address": inbound.address,
            "mtu": (inbound.mtu == null) ? null : int(inbound.mtu),
            "auto_route": (inbound.auto_route == "true"),
            "iproute2_table_index": (inbound.iproute2_table_index == null) ? null : int(inbound.iproute2_table_index),
            "iproute2_rule_index": (inbound.iproute2_rule_index == null) ? null : int(inbound.iproute2_rule_index),
            "auto_redirect": (inbound.auto_redirect == "true"),
            "auto_redirect_input_mark": inbound.auto_redirect_input_mark,
            "auto_redirect_output_mark": inbound.auto_redirect_output_mark,
            "strict_route": (inbound.strict_route == "true"),
            "route_address": inbound.route_address,
            "route_exclude_address": inbound.route_exclude_address,
            "route_address_set": inbound.route_address_set,
            "route_exclude_address_set": inbound.route_exclude_address_set,
            "endpoint_independent_nat": (inbound.endpoint_independent_nat == "true"),
            "stack": inbound.stack,
            "include_interface": inbound.include_interface,
            "exclude_interface": inbound.exclude_interface,
            "listen": inbound.listen,
            "listen_port": (inbound.listen_port == null) ? null : int(inbound.listen_port),
            "tcp_fast_open": (inbound.tcp_fast_open == "true"),
            "tcp_multi_path": (inbound.tcp_multi_path == "true"),
            "udp_fragment": (inbound.udp_fragment == "true"),
            "udp_timeout": inbound.udp_timeout,
            "detour": inbound.detour,
        });
    };

    push(config["inbounds"], {
        "type": inbound.type,
        "tag": inbound.tag,
        "network": inbound.network,
        "override_address": inbound.override_address,
        "override_port": (inbound.override_port == null) ? null : int(inbound.override_port),
        "users": [
            {
                "username": inbound.users_username,
                "name": inbound.users_name,
                "password": inbound.users_password,
                "uuid": inbound.users_uuid,
                "alterId": (inbound.users_alterId == null) ? null : int(inbound.users_alterId),
                "auth": inbound.users_auth,
                "auth_str": inbound.users_auth_str,
                "flow": inbound.users_flow,
            }
        ],
        "method": inbound.method,
        "password": inbound.password,
        "fallback": {
            "server": inbound.fallback_server,
            "server_port": (inbound.fallback_port == null) ? null : int(inbound.fallback_port),
        },
        "fallback_for_alpn": {
            "http/1.1": {
                "server": inbound.fallback_alpn_server,
                "server_port": (inbound.fallback_alpn_port == null) ? null : int(inbound.fallback_alpn_port),
            }
        },
        "up": inbound.up,
        "up_mbps": (inbound.up_mbps == null) ? null : int(inbound.up_mbps),
        "down": inbound.down,
        "down_mbps": (inbound.down_mbps == null) ? null : int(inbound.down_mbps),
        "obfs": (inbound.type == "hysteria2") ? {
            "type": inbound.obfs_type,
            "password": inbound.obfs_password,
        } : inbound.obfs,
        "recv_window_conn": (inbound.recv_window_conn == null) ? null : int(inbound.recv_window_conn),
        "recv_window_client": (inbound.recv_window_client == null) ? null : int(inbound.recv_window_client),
        "max_conn_client": (inbound.max_conn_client == null) ? null : int(inbound.max_conn_client),
        "disable_mtu_discovery": (inbound.disable_mtu_discovery == "true"),
        "version": (inbound.version == null) ? null : int(inbound.version),
        "strict_mode": (inbound.strict_mode == "true"),
        "handshake": {
            "server": inbound.handshake_server,
            "server_port": (inbound.handshake_port == null) ? null : int(inbound.handshake_port),
        },
        "congestion_control": inbound.congestion_control,
        "auth_timeout": inbound.auth_timeout,
        "zero_rtt_handshake": (inbound.zero_rtt_handshake == "true"),
        "heartbeat": inbound.heartbeat,
        "ignore_client_bandwidth": (inbound.ignore_client_bandwidth == "true"),
        "brutal_debug": (inbound.brutal_debug == "true"),
        "tls": {
            "enabled": (inbound.tls_enabled == "true"),
            "server_name": inbound.tls_server_name,
            "alpn": inbound.tls_alpn,
            "min_version": inbound.tls_min_version,
            "max_version": inbound.tls_max_version,
            "cipher_suites": inbound.tls_cipher_suites,
            "certificate": inbound.tls_certificate,
            "certificate_path": inbound.tls_certificate_path,
            "key": inbound.tls_key,
            "key_path": inbound.tls_key_path,
            "acme": {
                "domain": inbound.acme_domain,
                "data_directory": inbound.acme_data_directory,
                "default_server_name": inbound.acme_default_server_name,
                "email": inbound.acme_email,
                "provider": inbound.acme_provider,
                "disable_http_challenge": (inbound.acme_disable_http_challenge == "true"),
                "disable_tls_alpn_challenge": (inbound.acme_disable_tls_alpn_challenge == "true"),
                "alternative_http_port": (inbound.acme_alternative_http_port == null) ? null : int(inbound.acme_alternative_http_port),
                "alternative_tls_port": (inbound.acme_alternative_tls_port == null) ? null : int(inbound.acme_alternative_tls_port),
                "external_account": {
                    "key_id": inbound.acme_external_account_key_id,
                    "mac_key": inbound.acme_external_account_mac_key,
                },
                "dns01_challenge": {
                    "provider": inbound.dns01_provider,
                    "access_key_id": inbound.dns01_access_key_id,
                    "access_key_secret": inbound.dns01_access_key_secret,
                    "region_id": inbound.dns01_region_id,
                    "api_token": inbound.dns01_api_token,
                }
            },
            "ech": {
                "enabled": (inbound.ech_enabled == "true"),
                "pq_signature_schemes_enabled": (inbound.ech_pq_signature_schemes_enabled == "true"),
                "dynamic_record_sizing_disabled": (inbound.ech_dynamic_record_sizing_disabled == "true"),
                "key": inbound.ech_key,
                "key_path": inbound.ech_key_path,
            },
            "reality": {
                "enabled": (inbound.reality_enabled == "true"),
                "handshake": {
                    "server": inbound.reality_handshake_server,
                    "server_port": (inbound.reality_handshake_port == null) ? null : int(inbound.reality_handshake_port),
                },
                "private_key": inbound.reality_private_key,
                "short_id": inbound.reality_short_id,
                "max_time_difference": inbound.reality_max_time_difference,
            }
        },
        "multiplex": {
            "enabled": (inbound.multiplex_enabled == "true"),
            "padding": (inbound.multiplex_padding == "true"),
            "brutal": {
                "enabled": (inbound.tcp_brutal_enabled == "true"),
                "up_mbps": (inbound.tcp_brutal_up_mbps == null) ? null : int(inbound.tcp_brutal_up_mbps),
                "down_mbps": (inbound.tcp_brutal_down_mbps == null) ? null : int(inbound.tcp_brutal_down_mbps),
            }
        },
        "transport": {
            "type": inbound.transport_type,
            "host": inbound.transport_host,
            "path": inbound.transport_path,
            "method": inbound.transport_method,
            "headers": inbound.transport_headers,
            "idle_timeout": inbound.transport_idle_timeout,
            "ping_timeout": inbound.transport_ping_timeout,
            "max_early_data": (inbound.transport_max_early_data == null) ? null : int(inbound.transport_max_early_data),
            "early_data_header_name": inbound.transport_early_data_header_name,
            "service_name": inbound.transport_service_name,
            "permit_without_stream": (inbound.transport_permit_without_stream == "true"),
        },
        "listen": inbound.listen,
        "listen_port": (inbound.listen_port == null) ? null : int(inbound.listen_port),
        "tcp_fast_open": (inbound.tcp_fast_open == "true"),
        "tcp_multi_path": (inbound.tcp_multi_path == "true"),
        "udp_fragment": (inbound.udp_fragment == "true"),
        "udp_timeout": inbound.udp_timeout,
        "detour": inbound.detour,
    });
});


config = deepClean(config);

print(config);

const isAccessible = access("/var/etc/songbox/config", "rwx");
if (!isAccessible) {
    mkdir("/var/etc/songbox/config", 0o755);
}
writefile("/var/etc/songbox/config/config.json", config);

