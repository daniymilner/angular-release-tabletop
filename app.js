"use strict";

angular
	.module('release-tabletop', [
		'times.tabletop'
	])
	.config(['TabletopProvider', function(TabletopProvider){
		TabletopProvider.setTabletopOptions({
			key: 'https://docs.google.com/spreadsheets/d/1jiMpRnQfjpPkYNy21AwufQZTXM9p8xazmWgQxFVjhAw/pubhtml?gid=76162401&single=true',
			simpleSheet: true
		});
	}])
	.factory('copyFactory', [
		function(){
			this.copy = function(){
				document.querySelector('.form-control.copy').select();

				try{
					return document.execCommand('copy') ? 'success' : 'fail';
				}catch(e){
					return 'fail';
				}
			};
			this.copyClone = function(){
				document.querySelector('.form-control.copy-clone').select();

				try{
					return document.execCommand('copy') ? 'success' : 'fail';
				}catch(e){
					return 'fail';
				}
			};
			return this;
		}
	])
	.controller('mainCtrl', [
		'$scope',
		'Tabletop',
		'copyFactory',
		'$timeout',
		function($scope, Tabletop, Copy, $timeout){
			var that = this,
				timeoutPromise,
				colorRange = 17,
				isHiddenOldPlugins = true;

			this.colorClass = 'color_' + getRandomInt(1, colorRange);

			this.copy = function(){
				this.copyStatus = Copy.copy();
				$timeout.cancel(timeoutPromise);
				timeoutPromise = $timeout(function(){
					that.copyStatus = false;
				}, 3000);
			};

			this.copyClone = function(){
				this.copyStatus = Copy.copyClone();
				$timeout.cancel(timeoutPromise);
				timeoutPromise = $timeout(function(){
					that.copyStatus = false;
				}, 3000);
			};

			Tabletop.then(function(ttdata){
				var initialList = ttdata[0];
				that.resultArray = [];
				initHeader(initialList);
				initBody(initialList);
			});

			function initHeader(initial){
				that.headerList = [];
				Object
					.keys(initial[0])
					.filter(function(key){
						return key !== 'Plugins' && key !== 'Dependencies';
					})
					.forEach(function(item){
						var oldVersion = isOldVersion(item);

						that.headerList.push({
							name: item,
							checked: false,
							oldVersion: oldVersion,
							hidden: oldVersion
						});
					});
			}

			function initBody(initial){
				that.bodyList = [];
				initial.forEach(function(item){
					var res = {
						name: '',
						versions: [],
						dependencies: []
					};
					Object.keys(item).forEach(function(key){
						var oldVersion;

						switch(key){
							case 'Plugins':
								res.name = item[key];
								break;
							case 'Dependencies':
								res.dependencies = item[key].split(', ');
								break;
							default:
								oldVersion = isOldVersion(key);

								res.versions.push({
									key: key,
									value: item[key],
									checked: false,
									oldVersion: oldVersion,
									hidden: oldVersion
								});
						}
					});
					that.bodyList.push(res);
				});
			}

			function isOldVersion(name){
				var splited = name.split('.'),
					minor, major;
				if(splited.length === 3){
					major = parseInt(splited[0]);
					if(major === 1){
						return false;
					}
					minor = parseInt(splited[1]);
					return !minor || isNaN(minor) || minor < 44;
				}
				return false;
			}

			function filterOldVersion(item){
				return item.oldVersion;
			}

			function setHiddenFalse(item){
				item.hidden = false;
			}

			function setHiddenTrue(item){
				item.hidden = true;
			}

			this.activateOldPlugins = function(){
				if(isHiddenOldPlugins){
					that.headerList
						.filter(filterOldVersion)
						.forEach(setHiddenFalse);
					that.bodyList.forEach(function(plugin){
						plugin.versions
							.filter(filterOldVersion)
							.forEach(setHiddenFalse);
					});
				}else{
					that.headerList
						.filter(filterOldVersion)
						.forEach(setHiddenTrue);
					that.bodyList.forEach(function(plugin){
						plugin.versions
							.filter(filterOldVersion)
							.forEach(setHiddenTrue);
					});
				}
				isHiddenOldPlugins = !isHiddenOldPlugins;
			};

			this.changeStatus = function(plugin, version){
				var status = version.checked;
				uncheckAllHeaderItems();
				uncheckByName(plugin.name);
				version.checked = status;
				if(status){
					plugin.dependencies.forEach(function(dependency){
						checkOnDependency(dependency, version.key);
					});
				}
				buildArray();
			};

			this.changeAll = function(headerItem){
				var checked = headerItem.checked;
				uncheckAllHeaderItems();
				for(var j = 0; j < that.bodyList.length; j++){
					if(checked){
						headerItem.checked = checked;
						checkByNameAndVersion(that.bodyList[j].name, headerItem.name)
					}else{
						uncheckByName(that.bodyList[j].name);
					}
				}
				buildArray();
			};

			this.onMouseOver = function(version){
				activeByVersion(version.key);
			};

			this.onHeaderMouseOver = function(item){
				item.active = true;
				activeByVersion(item.name);
			};

			this.onMouseLeave = function(){
				unActiveAll();
			};

			function unActiveAll(){
				that.headerList.forEach(function(item){
					item.active = false;
				});
				that.bodyList.forEach(function(item){
					item.versions.forEach(function(version){
						version.active = false;
					})
				})
			}

			function activeByVersion(versionKey){
				for(var i = 0; i < that.bodyList.length; i++){
					for(var j = 0; j < that.bodyList[i].versions.length; j++){
						if(that.bodyList[i].versions[j].key === versionKey){
							that.bodyList[i].versions[j].active = true;
							break;
						}
					}
				}
				for(var k = 0; k < that.headerList.length; k++){
					if(that.headerList[k].name === versionKey){
						that.headerList[k].active = true;
						break;
					}
				}
			}

			function checkOnDependency(dependency, versionKey){
				for(var i = 0; i < that.bodyList.length; i++){
					if(that.bodyList[i].name === dependency){
						for(var j = 0; j < that.bodyList[i].versions.length; j++){
							if(that.bodyList[i].versions[j].key === versionKey){
								uncheckByName(that.bodyList[i].name);
								that.bodyList[i].versions[j].checked = true;
								that.bodyList[i].dependencies.forEach(function(dependency){
									checkOnDependency(dependency, that.bodyList[i].versions[j].key);
								});
								break;
							}
						}
						break;
					}
				}
			}

			function buildArray(){
				that.resultArray = [];
				that.bodyList.forEach(function(bodyItem){
					bodyItem.versions.filter(function(item){
						return item.checked;
					}).forEach(function(item){
						that.resultArray.push({
							name: bodyItem.name,
							version: item
						});
					});
				});
				checkSelectedHeader();
				makeResult();
			}

			function checkSelectedHeader(){
				if(that.bodyList.length === that.resultArray.length){
					for(var i = 0; i < that.headerList.length; i++){
						(function(e){
							if(that.resultArray.every(function(item){
									return item.version.key === that.headerList[e].name;
								})){
								that.headerList[e].checked = true;
							}
						})(i);
					}
				}
			}

			function makeResult(){
				that.line = 'node plugin install ';
				that.resultArray
					.filter(function(key){
						return key.version.value !== '-';
					})
					.forEach(function(item){
						that.line += item.name + '#' + item.version.value + ' ';
					});
				that.line = that.line.trim();

				that.cloneLine = that.resultArray
					.filter(function(key){
						return key.version.value !== '-';
					})
					.map(function(item){
						return 'git clone --branch ' + item.version.value + ' git@git.qapint.com:ewizard/' + item.name + '-plugin.git'
					})
					.join(' && ');
			}

			function uncheckByName(name){
				for(var i = 0; i < that.bodyList.length; i++){
					if(that.bodyList[i].name === name){
						that.bodyList[i].versions.forEach(function(version){
							version.checked = false;
						});
						break;
					}
				}
			}

			function checkByNameAndVersion(name, version){
				for(var i = 0; i < that.bodyList.length; i++){
					if(that.bodyList[i].name === name){
						that.bodyList[i].versions.forEach(function(item){
							item.checked = item.key === version;
						});
						break;
					}
				}
			}

			function uncheckAllHeaderItems(){
				that.headerList.forEach(function(item){
					item.checked = false;
				});
			}

			function getRandomInt(min, max){
				return Math.floor(Math.random() * (max - min + 1) + min);
			}

		}]);
