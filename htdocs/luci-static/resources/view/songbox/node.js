'use strict';
'require uci';
'require form';
'require view';
'require request';

return view.extend({

    render: function() {
        var m, s, o;

        m = new form.Map('songbox', _('Songbox Node'), _('Based on Sing-box, a universal proxy platform'));

        s = m.section(form.TypedSection, 'subscription', _('Subscription Management'));
        s.anonymous = true;
        
        o = s.option(form.DynamicList, 'url', _('Subscription URL'));
        o.rmempty = false;

        o = s.option(form.Button, 'update', _('Update Subscription'));
        o.inputtitle = _('Update');
        o.inputstyle = 'apply';
        o.onclick = function() {
            return fs.exec_direct('/usr/libexec/rpcd/songbox/subscription.uc').then((res) => {
				return location.reload();
			}).catch((err) => {
				ui.addNotification(null, E('p', _('An error occurred during updating subscriptions: %s').format(err)));
				return this.map.reset();
			});
		}

        o = s.option(form.Value, 'cron', _('Update Schedule'), _('disabled update if empty'));
        o.placeholder = '0 0 * * *';

        s = m.section(form.TypedSection, 'node', _('Node Management'));
        s.anonymous = true;



        return m.render();
    }
});