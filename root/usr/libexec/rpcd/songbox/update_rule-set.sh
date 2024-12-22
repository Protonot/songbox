#!/bin/sh

geosite_url='https://api.github.com/repos/SagerNet/sing-geosite/git/trees/rule-set'
geoip_url='https://api.github.com/repos/SagerNet/sing-geoip/git/trees/rule-set'
acl4ssr_url='https://api.github.com/repos/Protonot/luci-app-songbox/git/trees/rule-set'

fetch_and_write_uci() {
    local url=$1
    local option=$2

    data=$(curl -s $url | grep -o '"path": *"[^"]*"' | sed -e 's/"path": "//g' -e 's/"//g')
    if [ -n "$data" ]; then
        uci delete songbox.geo.$option > /dev/null 2>&1
        uci set songbox.geo=rule_set

        echo "$data" | while read -r path; do
            uci add_list songbox.geo.$option="${path%.srs}"
        done

        uci commit songbox
    else
        echo "$(date "+%Y-%m-%d %H:%M:%S") [Error] Failed to fetch $option rule-set" >> /var/run/songbox/run.log
        exit 1
    fi
}

echo "$(date "+%Y-%m-%d %H:%M:%S") [Info] Fetching rule-set list" >> /var/run/songbox/run.log
fetch_and_write_uci $geosite_url geosite
fetch_and_write_uci $geoip_url geoip
fetch_and_write_uci $acl4ssr_url acl4ssr
