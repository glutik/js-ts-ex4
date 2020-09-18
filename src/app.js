const inputSelect = document.querySelector("select");
const slicesCountPara = document.getElementById("slicesCount");
const cellsCountPara = document.getElementById("cellsCount");
const slicesDataPara = document.getElementById("slicesData");
const result = document.getElementById("result");

inputSelect.addEventListener("change", handleInputChange);

function handleInputChange() {
	if (this.value === "none") {
		resetResults();
	} else {
		const [pizzaParams, pizza] = initData(this.value);
		const [slicesCount, cellsCount, slicesData] = slicePizza(...pizzaParams, pizza);
		const rows = pizzaParams[0];
		const cols = pizzaParams[1];
		populateResults(slicesCount, cellsCount, rows, cols, slicesData);
	}
}

function resetResults() {
	slicesCountPara.innerText = "";
	cellsCountPara.innerText = "";
	slicesDataPara.innerText = "";
	result.innerText = "";
}

function populateResults(slicesCount, cellsCount, rows, cols, slicesData) {
	slicesCountPara.innerText = "Slices count: " + slicesCount;
	cellsCountPara.innerText = `Used cells: ${cellsCount}/${rows * cols} (${((cellsCount / rows / cols) * 100).toPrecision(
		2
	)}% succesfully sliced!)`;
	slicesDataPara.innerText = "Slices Data:";
	result.innerText = slicesData;
}

function initData(value) {
	const input = require(`./data/${value}.in`);
	const inputData = input.default.trim().split("\n");
	const pizzaParams = inputData[0].split(" ").map((param) => +param);
	return [pizzaParams, inputData.slice(1)];
}

function slicePizza(rowsNum, colsNum, minCells, maxSize, pizza) {
	let slicesCount = 0;
	let cellsCount = 0;
	let slicesData = "";
	let rowStartIndex = 0;
	let rowEndIndex = 0;

	while (rowEndIndex < rowsNum) {
		let slicesCountForSelectedRows = 0;
		let cellsUsedForSelectedRows = 0;
		let slicesDataForSelectedRows = "";
		let usedCellsRatio = 0;
		let bestEndRowSelection;
		while (rowEndIndex < rowsNum && rowEndIndex - rowStartIndex + 1 <= maxSize) {
			// iterate rows, find best ratio
			const r0 = rowStartIndex;
			let r1 = rowEndIndex;
			const rows = r1 - r0 + 1;
			const maxCols = Math.floor(maxSize / rows);
			const totalPossibleCells = rows * colsNum;
			const [slicesCounter, totalCellsUsed, slicesData] = generateSlicesForSelectedRows(pizza, r0, r1, maxCols, colsNum, minCells);
			const ratio = totalCellsUsed / totalPossibleCells;
			if (ratio > usedCellsRatio) {
				usedCellsRatio = ratio;
				slicesCountForSelectedRows = slicesCounter;
				slicesDataForSelectedRows = slicesData;
				cellsUsedForSelectedRows = totalCellsUsed;
				bestEndRowSelection = r1;
			}
			rowEndIndex++;
		}
		slicesCount += slicesCountForSelectedRows;
		cellsCount += cellsUsedForSelectedRows;
		slicesData += slicesDataForSelectedRows;
		rowStartIndex = rowEndIndex = bestEndRowSelection + 1;
	}
	return [slicesCount, cellsCount, slicesData];
}

function generateSlicesForSelectedRows(pizza, r0, r1, maxCols, colsNum, minCells) {
	let startCol = 0;
	let slicesCounter = 0;
	let totalCellsUsed = 0;
	let slicesData = "";

	while (startCol < colsNum) {
		let slice = "";
		for (let i = r0; i <= r1; i++) {
			slice += pizza[i].substr(startCol, Math.min(maxCols, colsNum - startCol));
		}
		let mushrooms = slice.match(/M/g) ? slice.match(/M/g).length : 0;
		let tomatoes = slice.match(/T/g) ? slice.match(/T/g).length : 0;
		if (mushrooms < minCells || tomatoes < minCells) {
			startCol++;
		} else {
			slicesCounter++;
			totalCellsUsed += (r1 - r0 + 1) * Math.min(maxCols, colsNum - startCol);
			slicesData += `${r0} ${startCol} ${r1} ${startCol + Math.min(maxCols, colsNum - startCol) - 1}
            `;
			startCol += maxCols;
		}
	}
	return [slicesCounter, totalCellsUsed, slicesData];
}
