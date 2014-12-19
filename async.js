//Question. if computer hits line with IIFE, does that behave like any function in node?


//Async Serial Execution
var doInOrder = function(input, callbackArray, done){
	function next (input) {
		var callback = callbackArray.shift();
		callback ? next(callback(input)) : done(input);
	}
	next(input);
}

// Async parallel execution
// Takes a callback and performs it on all inputs
// Returns new array
var doAlltogether = function(inputArray, callback, done){
	var numResults = inputArray.length;
	var count = 0;
	var result = []; //change to use inputArray to return inplace;
	inputArray.forEach(function (input, index){
		
		//setTimeout(function(){

		result[index] = callback(input);
		count++;
		//console.log(result);
		if (count == numResults) { done(result) };

		//}, Math.floor(Math.random()*5*1000))

	});
}



//Test Area
var inputs = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];

//doAlltogether(inputs, square, console.log);

doAlltogether(inputs, goDeep, console.log);
testAsync();


function square (input){
	return input * input;
}

function goDeep (input){
	var square5 = makeCallbacksArray(square, 5);
	return function (){
		var done;
		doInOrder(input, square5, function (result){
			done = result;
		});
		return done;
	}();
}

function makeCallbacksArray (callback, depth){
	result = [];
	for (var i = 0; i < depth; i++) {
		result.push(callback);
	};
	return result;
}


function testAsync (){
	for (var interval = 10; interval >= 0; interval-=1) {
		setTimeout(function(){
			console.log('this msg should be inserted');
		},interval);
	};
}