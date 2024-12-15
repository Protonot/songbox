// Thans to luci-app-unblockneteasemusic

'use strict';
'require dom';
'require form';
'require fs';
'require poll';
'require rpc';
'require ui';
'require view';

return view.extend({
	render: function() {
		var m, s, o;
		m = new form.Map('songbox');

		s = m.section(form.NamedSection, 'log', 'log', _('Status'));
		s.anonymous = true;

		s.tab('songbox_log', _('SongBox Plugin Status'));
		s.tab('singbox_log', _('SingBox Kernel Status'));

		o = s.taboption('songbox_log', form.Button, '_singbox_logclear');
		o.inputtitle = _('Clear Log');
		o.inputstyle = 'apply';
		o.onclick = function() {
			return fs.write('/var/run/songbox/run.log', '');
		}

		o = s.taboption('songbox_log', form.DummyValue, '_songbox_logview');
		o.render = function() {
			/* Thanks to luci-app-aria2 */
			var css = '					\
				#log_textarea {				\
					padding: 10px;			\
					text-align: left;		\
				}					\
				#log_textarea pre {			\
					padding: .5rem;			\
					word-break: break-all;		\
					margin: 0;			\
				}					\
				.description {				\
					background-color: #33ccff;	\
				}';

			var log_textarea = E('div', { 'id': 'log_textarea' },
				E('img', {
					'src': L.resource(['icons/loading.gif']),
					'alt': _('Loading'),
					'style': 'vertical-align:middle'
				}, _('Collecting data...'))
			);

			poll.add(L.bind(function() {
				return fs.read_direct('/var/run/songbox/run.log', 'text')
				.then(function(res) {
					var log = E('pre', { 'wrap': 'pre' }, [
						res.trim() || _('当前无日志。')
					]);

					dom.content(log_textarea, log);
				}).catch(function(err) {
					if (err.toString().includes('NotFoundError'))
						var log = E('pre', { 'wrap': 'pre' }, [
							_('日志文件不存在。')
						]);
					else
						var log = E('pre', { 'wrap': 'pre' }, [
							_('未知错误：%s。').format(err)
						]);

					dom.content(log_textarea, log);
				});
			}));

			return E([
				E('style', [ css ]),
				E('div', {'class': 'cbi-map'}, [
					E('h3', {'name': 'content'}, _('运行日志')),
					E('div', {'class': 'cbi-section'}, [
						log_textarea,
						E('div', {'style': 'text-align:right'},
							E('small', {}, _('每 %s 秒刷新。').format(L.env.pollinterval))
						)
					])
				])
			]);
		}

		o = s.taboption('singbox_log', form.Button, '_singbox_logclear');
		o.inputtitle = _('Clear Log');
		o.inputstyle = 'apply';
		o.onclick = function() {
			return fs.write('/var/run/songbox/singbox.log', '');
		}

		o = s.taboption('singbox_log', form.DummyValue, '_singbox_logview');
		o.render = function() {
			/* Thanks to luci-app-aria2 */
			var css = '					\
				#log_textarea {				\
					padding: 10px;			\
					text-align: left;		\
				}					\
				#log_textarea pre {			\
					padding: .5rem;			\
					word-break: break-all;		\
					margin: 0;			\
				}					\
				.description {				\
					background-color: #33ccff;	\
				}';

			var log_textarea = E('div', { 'id': 'log_textarea' },
				E('img', {
					'src': L.resource(['icons/loading.gif']),
					'alt': _('Loading'),
					'style': 'vertical-align:middle'
				}, _('Collecting data...'))
			);

			poll.add(L.bind(function() {
				return fs.read_direct('/var/run/songbox/singbox.log', 'text')
				.then(function(res) {
					var log = E('pre', { 'wrap': 'pre' }, [
						res.trim() || _('当前无日志。')
					]);

					dom.content(log_textarea, log);
				}).catch(function(err) {
					if (err.toString().includes('NotFoundError'))
						var log = E('pre', { 'wrap': 'pre' }, [
							_('日志文件不存在。')
						]);
					else
						var log = E('pre', { 'wrap': 'pre' }, [
							_('未知错误：%s。').format(err)
						]);

					dom.content(log_textarea, log);
				});
			}));

			return E([
				E('style', [ css ]),
				E('div', {'class': 'cbi-map'}, [
					E('h3', {'name': 'content'}, _('运行日志')),
					E('div', {'class': 'cbi-section'}, [
						log_textarea,
						E('div', {'style': 'text-align:right'},
							E('small', {}, _('每 %s 秒刷新。').format(L.env.pollinterval))
						)
					])
				])
			]);
		}

		return m.render();
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});