"use strict";

angular
	.module('release-tabletop', [
		'times.tabletop'
	])
	.config(['TabletopProvider', function(TabletopProvider){
		TabletopProvider.setTabletopOptions({
			key: 'https://docs.google.com/spreadsheets/d/1-Sgsypz98IxfgxuJpKbt-NaiM5K_c4MufvC3GRwvgg4/pubhtml?gid=1594711496&single=true',
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
				timeoutPromise;

			this.copy = function(){
				this.copyStatus = Copy.copy();
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
						return key !== 'Plugins';
					})
					.forEach(function(item){
						that.headerList.push({
							name: item,
							checked: false
						});
					});
			}

			function initBody(initial){
				that.bodyList = [];
				initial.forEach(function(item){
					var res = {
						name: '',
						versions: []
					};
					Object.keys(item).forEach(function(key){
						var version = {};
						if(key === 'Plugins'){
							res.name = item[key];
						}else{
							version.key = key;
							version.value = item[key];
							version.checked = false;
							res.versions.push(version);
						}
					});
					that.bodyList.push(res);
				});
			}

			this.changeStatus = function(pluginName, version){
				var status = version.checked;
				uncheckAllHeaderItems();
				if(that.resultArray.length){
					for(var j = 0; j < that.resultArray.length; j++){
						if(that.resultArray[j].name === pluginName){
							uncheckByName(pluginName);
							version.checked = status;
							break;
						}
					}
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

		}]);
