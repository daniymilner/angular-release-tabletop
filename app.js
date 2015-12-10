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
	.controller('mainCtrl', [
		'$scope',
		'Tabletop',
		function($scope, Tabletop){
			var that = this;

			this.checkedArray = [];

			Tabletop.then(function(ttdata){
				that.table = ttdata[0];
			});

			this.onChange = function(plugin, version){
				if(!isPluginInArray(plugin, version)){
					this.checkedArray.push({
						plugin: plugin,
						version: version
					});
				}else{
					removeItemFromArray(plugin, version);
				}

				createResultLine();
			};

			function isPluginInArray(plugin, version){
				return that.checkedArray.some(function(item){
					return plugin === item.plugin && version === item.version;
				});
			}

			function removeItemFromArray(plugin, version){
				for(var i = 0; i < that.checkedArray.length; i++){
					if(that.checkedArray[i].plugin === plugin && that.checkedArray[i].version === version){
						that.checkedArray.splice(i, 1);
						break;
					}
				}
			}

			function createResultLine(){
				that.result = 'node plugin install ';
				that.checkedArray.forEach(function(item){
					that.result += item.plugin + '#' + item.version + ' ';
				});
				that.result = that.result.trim();
			}
		}]);
