/**
* Created with Angular.
* User: dahnny012
* Date: 2015-01-19
* Time: 04:30 AM
* To change this template use Tools | Templates.
*/
(function(){
	var app = angular.module('store',[]);
	app.controller('StoreController',function(){
		this.product = gem;
	})
	var gems =[{
		name:'Some long as name',
		price:2.95,
		description:'. . ',
		canPurchase:false,
		soldOut:true,
	},
	{
		name:'Another long as name',
		price:2.95,
		description:'. . ',
		canPurchase:false,
		soldOut:true,
	}
	
	]
})();