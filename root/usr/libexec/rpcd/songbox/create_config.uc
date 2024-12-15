#!/usr/bin/ucode

import { cursor } from 'uci';
import { readlink, popen, writefile, mkdir, access } from 'fs';
import { isnan } from 'math';

const uci = cursor();

let config = {};

function mixedType(value) {
    let newValues = [];
    for (let key in value) {
        print(key, "\n");
        let num = int(key);
        print(num, type(num),"\n");
        if (isnan(num)) {
            push(newValues, key);
        } else {
            push(newValues, num);
        }
    }
    return newValues;
}

function addUrl(url) {
    if (match(url, /^geoip/)) {
        url = "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/" + url;
    }
    else if (match(url, /^geosite/)) {
        url = "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/" + url;
    }
    else
        url = "https://raw.githubusercontent.com/Protonot/luci-app-songbox/rule-set/" + url;
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

config = deepClean(config);

print(config);

const isAccessible = access("/var/etc/songbox/config", "rwx");
if (!isAccessible) {
    mkdir("/var/etc/songbox/config", 0o755);
}
writefile("/var/etc/songbox/config/config.json", config);

