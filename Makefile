# See /LICENSE for more information.
# This is free software, licensed under the GNU General Public License v2.

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for SongBox
LUCI_DEPENDS:=+dnsmasq-full +sing-box +kmod-nft-tproxy +curl
LUCI_PKGARCH:=all

PKG_LICENSE:=GPL-2.0
PKG_NAME:=luci-app-songbox
PKG_VERSION:=0.1
PKG_RELEASE:=3

define Package/luci-app-songbox/conffiles
/etc/config/songbox
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature