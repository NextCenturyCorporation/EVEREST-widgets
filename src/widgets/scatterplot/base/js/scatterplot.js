var scatterplot_base = {};

scatterplot_base.execute = function() {
	init();
}

scatterplot_base.update = function() {
  modifyData();
  updateHeatchart();
}

var numPoints = 1440,
    numRows = 24,
    numCols = 60,
    cellSize = 14,
    showingScatter = true,
    scatterDirty = false,
    data = null,
    cells = null,
    color = d3.interpolateRgb("white", "blue"); //("#ffffff", "#000000");  //c09

var hsize = cellSize * numCols,
		vsize = cellSize * numRows;

var getEmptyCells = function() {
    var emptyCells = [];
    for (var rowNum = 0; rowNum < numRows; rowNum++) {
        emptyCells.push([]);
        var row = emptyCells[emptyCells.length - 1];
        for (var colNum = 0; colNum < numCols; colNum++) {
            row.push({
                row: rowNum,
                col: colNum,
                density: 0,
                points: []
            });
        }
    }
    return emptyCells;
};

var clearCell = function(row, col) {
	cells[row][col].density = 0;
	cells[row][col].points = [];
}

var clearCells = function() {
    for (var rowNum = 0; rowNum < numRows; rowNum++) {
        for (var colNum = 0; colNum < numCols; colNum++) {
            cells[rowNum][colNum].density = 0;
            cells[rowNum][colNum].points = [];
        }
    }
};

var modifyData = function () {

  var x, y, col, row;
  for (var i = 0; i < numPoints; i=i+2) {
      x = Math.random() * hsize;
      y = Math.random() * vsize;
      col = Math.min(Math.floor(x / hsize * numCols), numCols - 1);
      row = Math.min(Math.floor(y / vsize * numRows), numRows - 1);

      col = Math.floor(col / 2);
      row = Math.floor(row / 2);
      
      data[i] = {
          x: x,
          y: y,
          col: col,
          row: row,
          cell: cells[row][col],
          ind: i
      };

      cells[row][col].points.push(data[data.length - 1]);
  }

};

var randomizeData = function() {
    data = [];

    if (cells === null) {
        cells = getEmptyCells();
    }
    else {
        clearCells();
    }

    var x, y, col, row;
    for (var i = 0; i < numPoints; i++) {
        x = Math.random() * hsize;
        y = Math.random() * vsize;
        col = Math.min(Math.floor(x / hsize * numCols), numCols - 1);
        row = Math.min(Math.floor(y / vsize * numRows), numRows - 1);

        data.push({
            x: x,
            y: y,
            col: col,
            row: row,
            cell: cells[row][col],
            ind: i
        });

        cells[row][col].points.push(data[data.length - 1]);
    }
};

var selectPoints = function(pointEls){
};

var deselectPoints = function(pointEls){
};


var selectCell = function(cell) {
    d3.select(cell).attr("stroke", "#f00").attr("stroke-width", 3);

    cell.parentNode.parentNode.appendChild(cell.parentNode);
    cell.parentNode.appendChild(cell);
};

var deselectCell = function(cell) {
    d3.select(cell).attr("stroke", "#fff").attr("stroke-width", 1);
};



var onCellOver = function(cell, data) {
    selectCell(cell);

    if (showingScatter) {
        var pointEls = [];

        for (var i = 0; i < data.points.length; i++) {
            pointEls.push(d3.select("div#scatterplot").select('[ind="' + data.points[i].ind + '"]').node());
        }

        selectPoints(pointEls);

      	d3.select("#cellInfo").text(data.row +":"+ data.col +" density = "+ data.points.length);

    }
};

var onCellOut = function(cell, data) {
    deselectCell(cell);

    if (showingScatter) {
        var pointEls = [];

        for (var i = 0; i < data.points.length; i++) {
            pointEls.push(d3.select("div#scatterplot").select('[ind="' + data.points[i].ind + '"]').node());
        }

        deselectPoints(pointEls);
    }
};



var createHeatchart = function() {
    var min = 999;
    var max = -999;
    var l;

    for (var rowNum = 0; rowNum < cells.length; rowNum++) {
        for (var colNum = 0; colNum < numCols; colNum++) {
            l = cells[rowNum][colNum].points.length;

            if (l > max) {
                max = l;
            }
            if (l < min) {
                min = l;
            }
        }
    }

    var heatchart = d3.select("div#heatchart").append("svg:svg").attr("width", hsize).attr("height", vsize);

    heatchart.selectAll("g").data(cells).enter().append("svg:g").selectAll("rect").data(function(d) {
        return d;
    }).enter().append("svg:rect").attr("x", function(d, i) {
        return d.col * (hsize / numCols);
    }).attr("y", function(d, i) {
        return d.row * (vsize / numRows);
    }).attr("width", hsize / numCols).attr("height", vsize / numRows).attr("fill", function(d, i) {
        return color((d.points.length - min) / (max - min));
    }).attr("stroke", "#fff").attr("cell", function(d) {
        return "r" + d.row + "c" + d.col;
    }).on("mouseover", function(d) {
        onCellOver(this, d);
    }).on("mouseout", function(d) {
        onCellOut(this, d);
    });
};

var updateHeatchart = function() {
    var min = 999;
    var max = -999;
    var l;

    for (var rowNum = 0; rowNum < cells.length; rowNum++) {
        for (var colNum = 0; colNum < numCols; colNum++) {
            l = cells[rowNum][colNum].points.length;

            if (l > max) {
                max = l;
            }
            if (l < min) {
                min = l;
            }
        }
    }

    d3.select("div#heatchart").select("svg").selectAll("g").data(cells).selectAll("rect").data(function(d) {
        return d;
    }).attr("x", function(d, i) {
        return d.col * (hsize / numCols);
    }).attr("y", function(d, i) {
        return d.row * (vsize / numRows);
    }).attr("fill", function(d, i) {
        return color((d.points.length - min) / (max - min));
    }).attr("cell", function(d) {
        return "r" + d.row + "c" + d.col;
    }).on("mouseover", function(d) {
        onCellOver(this, d);
    }).on("mouseout", function(d) {
        onCellOut(this, d);
    });
};

var init = function() {
    randomizeData();

    createHeatchart();
};

init();