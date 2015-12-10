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
	.controller('ExampleCtrl', [
		'$scope',
		'Tabletop',
		function($scope, Tabletop){
			Tabletop.then(function(ttdata){
				console.log(ttdata);
			});
		}]);
