#!/usr/bin/env lua

local json = require "luci.jsonc"
local uci = require "luci.model.uci".cursor()
local fs = require "nixio.fs"

local config = {
    log = {},
    ntp = {},
    dns = {
        servers = {},
        rules = {},
        fakeip = {}
    },
    route = {
        rules = {},
        rule_set = {}
    },
    experimental = {
        cache_file = {},
        clash_api = {}
    },
    inbounds = {},
    outbounds = {}
}

function convert_value(value)
    if value == "true" then
        return true
    elseif value == "false" then
        return false
    elseif tonumber(value) then
        return tonumber(value)
    else
        return value
    end
end

function should_include_key(key, include_enabled)
    local exclude_keys = { ".name", ".type", ".index", ".anonymous" }
    if not include_enabled then
        table.insert(exclude_keys, "enabled")
    end
    for _, exclude_key in ipairs(exclude_keys) do
        if key == exclude_key then
            return false
        end
    end
    return true
end

function global_rulesets(key, value)
    if string.match(value, "^geoip") then
        value = 'https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/' .. value
    elseif string.match(value, "^geosite") then
        value = 'https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/' .. value
    else
        value = value
    end
    return value
end

function create_config(section_name, config_name, is_single, include_enabled)
    uci:foreach("songbox", section_name, function(section)
        if section.enabled ~= "0" then
            local options = {}
            for key, value in pairs(section) do
                if should_include_key(key, include_enabled) then
                    value = convert_value(value)
                    if is_single then
                        config_name[key] = value
                    elseif section_name == "global_rule_sets" and key == "tag" then
                        options[key] = global_rulesets(key, value)
                    else
                        options[key] = value
                    end
                end
            end
            if not is_single then
                table.insert(config_name, options)
            end
        end
    end)
    return config_name
end

function create_experimental_config()
    local function add_if_not_empty(table, key, value)
        if value and value ~= '' then
            table[key] = convert_value(value)
        end
    end
    add_if_not_empty(config.experimental.cache_file, "enabled", uci:get("songbox", "experimental", "enabled"))
    add_if_not_empty(config.experimental.cache_file, "path", uci:get("songbox", "experimental", "path"))
    add_if_not_empty(config.experimental.cache_file, "cache_id", uci:get("songbox", "experimental", "cache_id"))
    add_if_not_empty(config.experimental.cache_file, "store_fakeip", uci:get("songbox", "experimental", "store_fakeip"))
    add_if_not_empty(config.experimental.cache_file, "store_rdrc", uci:get("songbox", "experimental", "store_rdrc"))
    add_if_not_empty(config.experimental.cache_file, "rdrc_timeout", uci:get("songbox", "experimental", "rdrc_timeout"))

    add_if_not_empty(config.experimental.clash_api, "external_controller", uci:get("songbox", "experimental", "external_controller"))
    add_if_not_empty(config.experimental.clash_api, "external_ui", uci:get("songbox", "experimental", "external_ui"))
    add_if_not_empty(config.experimental.clash_api, "external_ui_download_url", uci:get("songbox", "experimental", "external_ui_download_url"))
    add_if_not_empty(config.experimental.clash_api, "external_ui_download_detour", uci:get("songbox", "experimental", "external_ui_download_detour"))
    add_if_not_empty(config.experimental.clash_api, "secret", uci:get("songbox", "experimental", "secret"))
end

create_config("log", config.log, true)
create_config("ntp", config.ntp, true, true)
create_config("dns_server", config.dns.servers)
create_config("dns_rules", config.dns.rules)
create_config("dns_fakeip", config.dns.fakeip, true, true)
create_config("dns_advanced", config.dns, true)
create_config("route_advanced", config.route, true)
create_config("global_rule_sets", config.route.rule_set)
create_config("inbound", config.inbounds)
create_config("outbound", config.outbounds)

create_experimental_config()

local json_str = json.stringify(config, 2):gsub("\\/", "/")

if not fs.access("/var/etc/songbox/config") then
    fs.mkdirr("/var/etc/songbox/config")
end

local file = io.open("/var/etc/songbox/config/config.json", "w")
file:write(json_str)
file:close()