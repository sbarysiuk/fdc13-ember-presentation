var express = require('express');
var _ = require('underscore');
var app = express();

app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
});

var _expense_id = 3;

function _next_id() {
	return ++_expense_id;
}

var EXPENSES = [
		{id:1, description: 'Restaurant', money:50.00, date: '04-11-2013', category: 'Food'},
		{id:2, description: 'Meeting in Vilnius', money:15.00, date: '03-11-2013', category: 'Travelling'}
	];

app.get('/expenses', function(req, res){
	res.json({
		'expenses': EXPENSES
	});
});

app.get('/expense/:id', function(req, res){
	if(req.params.id) {
		var expense = _findExpenseById(req.params.id);

		if(expense) {
			res.json(expense);
		}
		else {
			res.status(404);
		}
	}
	else {
		res.status(404);
	}
});

app.put('/expenses/:id', function(req, res) {
	var expense = req.body['expense'];
	var _old_expense = _findExpenseById(req.params.id);
	
	_old_expense.description = expense.description;	
	_old_expense.category = expense.category;	
	_old_expense.money = expense.money;
	_old_expense.date = expense.date;

	res.json({
		'expense': _old_expense
	});
});

app.post('/expenses', function(req, res) {
	var expense = req.body['expense'];
	expense.id = _next_id();
	EXPENSES.push(expense);
	res.json({
		'expense': expense
	});
});

function _findExpenseById(id) {
	return _.find(EXPENSES, function(item) {
		return item.id == id;
	});	
}

app.listen(3000);