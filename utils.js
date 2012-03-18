function createArray(length) {
    var a = new Array(length || 0);

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < length; i++) {
            a[i] = createArray.apply(this, args);
        }
    }

    return a;
}

function arrayContains(array, element) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == element) {
			return true;
		}
	}
	
	return false;
}
