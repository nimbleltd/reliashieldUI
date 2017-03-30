// page init
jQuery(function(){
	initTabs();
	initRetinaCover();
});

// content tabs init
function initTabs() {
	jQuery('ul.tabset').tabset({
		tabLinks: 'a'
	});
}

function initRetinaCover() {
	jQuery('[class*= decor]').retinaCover();
}

/*
 * jQuery Tabs plugin
 */

;(function($, $win) {
	'use strict';

	function Tabset($holder, options) {
		this.$holder = $holder;
		this.options = options;

		this.init();
	}

	Tabset.prototype = {
		init: function() {
			this.$tabLinks = this.$holder.find(this.options.tabLinks);

			this.setStartActiveIndex();
			this.setActiveTab();

			if (this.options.autoHeight) {
				this.$tabHolder = $(this.$tabLinks.eq(0).attr(this.options.attrib)).parent();
			}
		},

		setStartActiveIndex: function() {
			var $classTargets = this.getClassTarget(this.$tabLinks);
			var $activeLink = $classTargets.filter('.' + this.options.activeClass);
			var $hashLink = this.$tabLinks.filter('[' + this.options.attrib + '="' + location.hash + '"]');
			var activeIndex;

			if (this.options.checkHash && $hashLink.length) {
				$activeLink = $hashLink;
			}

			activeIndex = $classTargets.index($activeLink);

			this.activeTabIndex = this.prevTabIndex = (activeIndex === -1 ? (this.options.defaultTab ? 0 : null) : activeIndex);
		},

		setActiveTab: function() {
			var self = this;

			this.$tabLinks.each(function(i, link) {
				var $link = $(link);
				var $classTarget = self.getClassTarget($link);
				var $tab = $($link.attr(self.options.attrib));

				if (i !== self.activeTabIndex) {
					$classTarget.removeClass(self.options.activeClass);
					$tab.addClass(self.options.tabHiddenClass).removeClass(self.options.activeClass);
				} else {
					$classTarget.addClass(self.options.activeClass);
					$tab.removeClass(self.options.tabHiddenClass).addClass(self.options.activeClass);
				}

				self.attachTabLink($link, i);
			});
		},

		attachTabLink: function($link, i) {
			var self = this;

			$link.on(this.options.event + '.tabset', function(e) {
				e.preventDefault();

				if (self.activeTabIndex === self.prevTabIndex && self.activeTabIndex !== i) {
					self.activeTabIndex = i;
					self.switchTabs();
				}
			});
		},

		resizeHolder: function(height) {
			var self = this;

			if (height) {
				this.$tabHolder.height(height);
				setTimeout(function() {
					self.$tabHolder.addClass('transition');
				}, 10);
			} else {
				self.$tabHolder.removeClass('transition').height('');
			}
		},

		switchTabs: function() {
			var self = this;

			var $prevLink = this.$tabLinks.eq(this.prevTabIndex);
			var $nextLink = this.$tabLinks.eq(this.activeTabIndex);

			var $prevTab = this.getTab($prevLink);
			var $nextTab = this.getTab($nextLink);

			$prevTab.removeClass(this.options.activeClass);

			if (self.haveTabHolder()) {
				this.resizeHolder($prevTab.outerHeight());
			}

			setTimeout(function() {
				self.getClassTarget($prevLink).removeClass(self.options.activeClass);

				$prevTab.addClass(self.options.tabHiddenClass);
				$nextTab.removeClass(self.options.tabHiddenClass).addClass(self.options.activeClass);

				self.getClassTarget($nextLink).addClass(self.options.activeClass);

				if (self.haveTabHolder()) {
					self.resizeHolder($nextTab.outerHeight());

					setTimeout(function() {
						self.resizeHolder();
						self.prevTabIndex = self.activeTabIndex;
					}, self.options.animSpeed);
				} else {
					self.prevTabIndex = self.activeTabIndex;
				}
			}, this.options.autoHeight ? this.options.animSpeed : 1);
		},

		getClassTarget: function($link) {
			return this.options.addToParent ? $link.parent() : $link;
		},

		getActiveTab: function() {
			return this.getTab(this.$tabLinks.eq(this.activeTabIndex));
		},

		getTab: function($link) {
			return $($link.attr(this.options.attrib));
		},

		haveTabHolder: function() {
			return this.$tabHolder && this.$tabHolder.length;
		},

		destroy: function() {
			var self = this;

			this.$tabLinks.off('.tabset').each(function() {
				var $link = $(this);

				self.getClassTarget($link).removeClass(self.options.activeClass);
				$($link.attr(self.options.attrib)).removeClass(self.options.activeClass + ' ' + self.options.tabHiddenClass);
			});

			this.$holder.removeData('Tabset');
		}
	};

	$.fn.tabset = function(options) {
		options = $.extend({
			activeClass: 'active',
			addToParent: false,
			autoHeight: false,
			checkHash: false,
			defaultTab: true,
			animSpeed: 500,
			tabLinks: 'a',
			attrib: 'href',
			event: 'click',
			tabHiddenClass: 'js-tab-hidden'
		}, options);
		options.autoHeight = options.autoHeight && $.support.opacity;

		return this.each(function() {
			var $holder = $(this);

			if (!$holder.data('Tabset')) {
				$holder.data('Tabset', new Tabset($holder, options));
			}
		});
	};
}(jQuery, jQuery(window)));

/*
 * jQuery retina cover plugin
 */
 ;(function($) {
 	'use strict';

 	var styleRules = {};
 	var templates = {
 		'2x': [
 			'(-webkit-min-device-pixel-ratio: 1.5)',
 			'(min-resolution: 192dpi)',
 			'(min-device-pixel-ratio: 1.5)',
 			'(min-resolution: 1.5dppx)'
 		],
 		'3x': [
 			'(-webkit-min-device-pixel-ratio: 3)',
 			'(min-resolution: 384dpi)',
 			'(min-device-pixel-ratio: 3)',
 			'(min-resolution: 3dppx)'
 		]
 	};

 	function addSimple(imageSrc, media, id) {
 		var style = buildRule(id, imageSrc);

 		addRule(media, style);
 	}

 	function addRetina(imageData, media, id) {
 		var currentRules = templates[imageData[1]].slice();
 		var patchedRules = currentRules;
 		var style = buildRule(id, imageData[0]);

 		if (media !== 'default') {
 			patchedRules = $.map(currentRules, function(ele, i) {
 				return ele + ' and ' + media;
 			});
 		}

 		media = patchedRules.join(',');

 		addRule(media, style);
 	}

 	function buildRule(id, src) {
 		return '#' + id + '{background-image: url("' + src + '");}';
 	}

 	function addRule(media, rule) {
 		var $styleTag = styleRules[media];
 		var styleTagData;
 		var rules = '';

 		if (media === 'default') {
 			rules = rule + ' ';
 		} else {
 			rules = '@media ' + media + '{' + rule + '}';
 		}

 		if (!$styleTag) {
 			styleRules[media] = $('<style>').text(rules).appendTo('head');
 		} else {
 			styleTagData = $styleTag.text();
 			styleTagData = styleTagData.substring(0, styleTagData.length - 2) + ' }' + rule + '}';
 			$styleTag.text(styleTagData);
 		}
 	}

 	$.fn.retinaCover = function() {
 		return this.each(function() {
 			var $block = $(this);
 			var $items = $block.children('[data-srcset]');
 			var id = 'bg-stretch' + Date.now() + (Math.random() * 1000).toFixed(0);

 			if ($items.length) {
 				$block.attr('id', id);

 				$items.each(function() {
 					var $item = $(this);
 					var data = $item.data('srcset').split(', ');
 					var media = $item.data('media') || 'default';
 					var dataLength = data.length;
 					var itemData;
 					var i;

 					for (i = 0; i < dataLength; i++) {
 						itemData = data[i].split(' ');

 						if (itemData.length === 1) {
 							addSimple(itemData[0], media, id);
 						} else {
 							addRetina(itemData, media, id);
 						}
 					}
 				});
 			}

 			$items.detach();
 		});
 	};
 }(jQuery));
