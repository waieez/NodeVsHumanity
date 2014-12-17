var roundRobin = function (array, robin){
	//gets first item in 'set' or moves item to back.
	var index = array.indexOf(robin);
	if (index != -1) {
		array.splice(index, 1);
		array.push(robin);
	}
	robin = array.shift()
	return [array, robin];
}

module.exports = roundRobin;