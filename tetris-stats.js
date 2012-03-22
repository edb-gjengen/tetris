function TetrisStats() {
	this.countBrickTypes = Array(8);

	this.countLineCombosCleared = Array(5);
	this.countLinesCleared = 0;

	this.newBrick = function(brickId) {
		if (brickId < 0 || brickId > 7) {
			return false;
		}

		this.countBrickTypes[brickId]++;
		return true;
	}

	this.linesCleared = function(amount) {
		if (amount < 0 || amount > 4) {
			return false;
		}

		this.countLineCombosCleared[amount]++;
		this.countLinesCleared += amount;
		return true;
	}

	this.TetrisStats = function() {
		for (var i = 0; i < this.countBrickTypes.length; i++) {
			this.countBrickTypes[i] = 0;
		}

		for (var i = 0; i < this.countLineCombosCleared.length; i++) {
			this.countLineCombosCleared[i] = 0;
		}
	}
	this.TetrisStats();
}
