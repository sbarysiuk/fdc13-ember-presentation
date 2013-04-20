App = Ember.Application.create();

var CATEGORIES = ['Food', 'Travelling', 'Hobby', 'Car'];

App.Router.map(function(){
	this.resource('expenses', {path: '/'}, function(){
		this.route('new');
		this.route('stats');
	});

	this.resource('expense', {path: '/:expense_id'});
});

App.ExpensesIndexRoute = Ember.Route.extend({
	model: function(){
		return App.Expense.find();
	}
});

App.ExpensesIndexController = Ember.ArrayController.extend({
	total: function(){
		var total = 0;
		this.get('model').forEach(function(item){
			total += item.get('money');
		});
		return total;
	}.property('@each.money')
});

App.ExpensesNewController = Ember.Controller.extend({
	obj: {},
	categories: CATEGORIES,
	save: function(){
		var obj = this.get('obj');
		App.Expense.createRecord({
			description: obj.description,
			money: parseInt(obj.money),
			category: obj.category,
			date: new Date()
		});
		this.get('store').commit();
		this.transitionToRoute('expenses');
	}
});

App.ExpenseRoute = Ember.Route.extend({
	setupController: function(controller){
		controller.set('_money', controller.get('money'));
	}
});

App.ExpenseController = Ember.ObjectController.extend({
	_money: 0,
	categories: CATEGORIES,
	save: function(){
		this.set('money', parseInt(this.get('_money')));
		this.get('store').commit();
		this.transitionToRoute('expenses');	
	}
});

App.ExpensesChartView = Ember.View.extend({
	tagName: 'div',
	chartData: {
		data:[],
		legend: []
	},
	chart: null,
	didInsertElement: function(){
		if(!this.get('chart')) {
			var chart = Raphael(this.get('elementId'));
			this.set('chart', chart);
		}
	},
	updateChart: function(){
		var chart = this.get('chart');
		var chartData = this.get('chartData');
		chart.clear();
		chart.piechart(220, 100, 100, chartData.data, {
			legend: chartData.legend,
			legendpos: "south"
		});
	}.observes('chartData')

});

App.ExpensesStatsRoute = Ember.Route.extend({
	model: function(){
		return App.Expense.find();
	}
});

App.ExpensesStatsController = Ember.ArrayController.extend({
	chartData: function(){
		var chartData = {
			data: [],
			legend: []
		};

		var _data = {};
		this.get('model').forEach(function(item){
			var categoryName = item.get('category');
			if(_data[categoryName] != undefined) {
				_data[categoryName] = _data[categoryName] + item.get('money');
			}
			else {
				_data[categoryName] = item.get('money');
			}
		});

		var categories = Ember.keys(_data);
		categories.forEach(function(key){
			chartData.legend.push(key);
			chartData.data.push(_data[key]);
		});

		return chartData;
	}.property('@each.money', '@each.category')
});

Ember.Handlebars.registerBoundHelper('fromNow', function(date){
	return moment(date).fromNow();
});

App.Store = DS.Store.extend({
	revision: 12,
	adapter: DS.RESTAdapter.extend({
		url:'http://localhost:3000'
	})
});

App.Expense = DS.Model.extend({
	description: DS.attr('string'),
	money: DS.attr('number'),
	date: DS.attr('date'),
	category: DS.attr('string')
});

App.Expense.FIXTURES = [
	{id: 1, description: 'Going to bar...', money: 50, date: new Date('04/01/2013'), category: 'Food'},
	{id: 2, description: 'Trip to Vilnius', money: 150, date: new Date('04/06/2013'), category: 'Travelling'}
];
