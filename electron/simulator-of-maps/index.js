const ipc = require('electron').ipcRenderer
const fs = require('fs')
const {Tile} = require('./libraries/game')
const SVG=require('@svgdotjs/svg.js').SVG
const DOM=require('./libraries/dom')

let draw = SVG().addTo('body').size('100vw','100vh')













//************************************* */
let elemloading;
let map_config;
let tiles;
let currentW, currentH;
let posX = 0, posY = 0, movementX = 0, movementY = 0;
let dragX, dragY;

let main = _ => {
	loading(true);
	fs.readFile("config.json", (e, data) => {
		let obj = JSON.parse(data);
		obj.filename = "config.json";
		setMapConfig(obj);
	});
}

let loading = b => {
	if (b) {
		elemloading = draw.text('The game is loading...')
		elemloading.font({ fill: '#ccc', family: 'Inconsolata', size:'64', anchor: 'middle' })
		.center(DOM.vwTOpx(draw.width())*0.5, DOM.vhTOpx(draw.height())*0.5)// when resize change it!!!!!!!!!!!!!!
		elemloading.animate(3000).ease()// NEXT THING TO DO
	}
	else {
		elemloading.style.opacity = 0;
		elemloading.style.animationName = 'fadein';
		elemloading.addEventListener('animationend', () => document.body.removeChild(elemloading), false);
	}
}

let setMapConfig = configJSON => {
	if (undefined !== configJSON.map && undefined !== configJSON.tile && undefined !== configJSON.map.dimensions
		&& configJSON.tile.dimensions > 0 &&
		((configJSON.map.dimensions.x > 0 && configJSON.map.dimensions.y > 0) || configJSON.map.dimensions === -1)) {
		map_config = configJSON;
		//generate random seed
		if (!map_config.map.seed)
			map_config.map.seed = Math.random();
		ipc.send('logWindow', "seed: " + map_config.map.seed);
		noise.seed(map_config.map.seed);
		map_config.element = document.getElementById("map");
		currentW = map_config.element.offsetWidth;
		currentH = map_config.element.offsetHeight;
		generateCSS();
		rendertiles("create");
		document.body.onresize = () => rendertiles("resize");
		map_config.element.ondragstart = (e) => {
			dragX = e.x;
			dragY = e.y;
		}
		map_config.element.ondragend = (e) => {
			movementX = Math.round((dragX - e.x) / map_config.tile.dimensions);
			movementY = Math.round((dragY - e.y) / map_config.tile.dimensions);
			moveTiles();
		}
	}
	else
		throw new Error("Invalid configuration file " + configJSON.filename);
}

let generateCSS = () => {
	let css = document.createElement("style");
	css.innerHTML = ".tile{ width:" + map_config.tile.dimensions + "px;height:" + map_config.tile.dimensions + "px}";
	document.head.appendChild(css);
	//loading images...
	let i = 0;
	let downloadingImage = new Image();
	downloadingImage.onload = () => {
		i++;
		if (i < map_config.tileset.length)
			downloadingImage.src = map_config.tileset[i].img;
	};
	downloadingImage.src = map_config.tileset[i].img;
}

let rendertiles = (rendertype) => {
	if (rendertype === "create") {
		let maxX = Math.floor(calcMaxXTiles() / 2),
			minX = -Math.ceil(calcMaxXTiles() / 2),
			maxY = Math.floor(calcMaxYTiles() / 2),
			minY = -Math.ceil(calcMaxYTiles() / 2);
		tiles = {};
		for (let j = minY; j < maxY; j++) {
			for (let i = minX + (minX % 2 === -1); i < maxX; i += 2)
				createTile(i, j);
			for (let i = minX + (minX % 2 === 0); i < maxX; i += 2)
				createTile(i, j);
		}
		loading(false);
	}
	else
		if (rendertype === "resize") {
			let zoomin = (map_config.element.offsetWidth - currentW) < 0;
			let zoomout = (map_config.element.offsetWidth - currentW) > 0;
			currentW = map_config.element.offsetWidth;
			currentH = map_config.element.offsetHeight;
			let maxX = Math.floor(calcMaxXTiles() / 2) + posX,
				minX = -Math.ceil(calcMaxXTiles() / 2) + posX,
				maxY = Math.floor(calcMaxYTiles() / 2) + posY,
				minY = -Math.ceil(calcMaxYTiles() / 2) + posY;
			let rightLimit = currentMaxX(),
				leftLimit = currentMinX(),
				downLimit = currentMaxY(),
				upLimit = currentMinY();
			if (zoomin) {/*
				for (let j = upLimit; j < minY; j++) {
					for (let i = leftLimit; i < maxX; i++) {
						map_config.element.removeChild(tiles[i + "," + j].element);
					}
				}
				for (let j = upLimit; j < maxY; j++) {
					for (let i = maxX; i <= rightLimit; i++) {
						map_config.element.removeChild(tiles[i + "," + j].element);
					}
				}
				for (let j = minY; j <= downLimit; j++) {
					for (let i = leftLimit; i < minX; i++) {
						map_config.element.removeChild(tiles[i + "," + j].element);
					}
				}
				for (let j = maxY; j <= downLimit; j++) {
					for (let i = minX; i <= rightLimit; i++) {
						map_config.element.removeChild(tiles[i + "," + j].element);
					}
				}*/
			}
			if (zoomout) {
				for (let j = minY; j < maxY; j++) {
					for (let i = minX + (minX % 2 === -1); i < maxX; i += 2) {
						if (tiles[i + "," + j])
							map_config.element.appendChild(tiles[i + "," + j].element);
						else
							createTile(i, j);
					}
					for (let i = minX + (minX % 2 === 0); i < maxX; i += 2) {
						if (tiles[i + "," + j])
							map_config.element.appendChild(tiles[i + "," + j].element);
						else
							createTile(i, j);
					}
				}
			}
			
			for (let j = upLimit; j <= downLimit; j++) {
				for (let i = leftLimit; i <= rightLimit; i++) {
					moveTile(tiles[i + "," + j]);
				}
			}
		}
		else
			if (rendertype === "move") {
				let rightLimit = currentMaxX(),
					leftLimit = currentMinX(),
					downLimit = currentMaxY(),
					upLimit = currentMinY();
				posX += movementX;
				let maxX = Math.floor(calcMaxXTiles() / 2) + posX,
					minX = -Math.ceil(calcMaxXTiles() / 2) + posX,
					maxY = Math.floor(calcMaxYTiles() / 2) + posY,
					minY = -Math.ceil(calcMaxYTiles() / 2) + posY;
				if (movementX < 0)// only left
				{
					for (let j = upLimit; j <= downLimit; j++) {
						for (let i = rightLimit; i < maxX; i++)
						{
							if (tiles[i + "," + j] && tiles[i + "," + j].element.parentElement==tiles[i + "," + j])
								map_config.element.removeChild(tiles[i + "," + j].element);
						}
						for (let i = minX; i <= leftLimit; i++) {
							if (tiles[i + "," + j])
								map_config.element.appendChild(tiles[i + "," + j].element);
							else
								createTile(i, j);
						}
					}
				}
				else
					if (movementX > 0)// only right
					{
						for (let j = upLimit; j <= downLimit; j++) {
							for (let i = minX; i <= leftLimit; i++)
							{
								if (tiles[i + "," + j] && tiles[i + "," + j].element.parentElement==tiles[i + "," + j])
									map_config.element.removeChild(tiles[i + "," + j].element);
							}
							for (let i = rightLimit; i < maxX; i++) {
								if (tiles[i + "," + j])
									map_config.element.appendChild(tiles[i + "," + j].element);
								else
									createTile(i, j);
							}
						}
					}
				rightLimit = currentMaxX();
				leftLimit = currentMinX();
				downLimit = currentMaxY();
				upLimit = currentMinY();
				posY += movementY;
				maxY = Math.floor(calcMaxYTiles() / 2) + posY;
				minY = -Math.ceil(calcMaxYTiles() / 2) + posY;
				if (movementY < 0)// only up
				{
					for (let i = leftLimit; i <= rightLimit; i++) {
						for (let j = downLimit; j < maxY; j++)
						{
							if (tiles[i + "," + j] && tiles[i + "," + j].element.parentElement==tiles[i + "," + j])
								map_config.element.removeChild(tiles[i + "," + j].element);
						}
						for (let j = minY; j <= upLimit; j++) {
							if (tiles[i + "," + j])
								map_config.element.appendChild(tiles[i + "," + j].element);
							else
								createTile(i, j);
						}
					}
				}
				else
					if (movementY > 0)// only down
					{
						for (let i = leftLimit; i <= rightLimit; i++) {
							for (let j = minY; j <= upLimit; j++)
							{
								if (tiles[i + "," + j] && tiles[i + "," + j].element.parentElement==tiles[i + "," + j])
									map_config.element.removeChild(tiles[i + "," + j].element);
							}
							for (let j = downLimit; j < maxY; j++) {
								if (tiles[i + "," + j])
									map_config.element.appendChild(tiles[i + "," + j].element);
								else
									createTile(i, j);
							}
						}
					}

				movementX = movementY = 0;
				rightLimit = currentMaxX();
				leftLimit = currentMinX();
				downLimit = currentMaxY();
				upLimit = currentMinY();
				for (let j = upLimit; j <= downLimit; j++) {
					for (let i = leftLimit; i <= rightLimit; i++) {
						moveTile(tiles[i + "," + j]);
					}
				}
			}
}

let createTile = (data_x, data_y, data_z=0) => {
	if (checkValidPosition(data_x, data_y)) {
		let obj = tiles[data_x + "," + data_y] || new Tile(map_config, data_x, data_y);
		obj.element.className = "tile";
		obj.element.dataset.x = data_x;
		obj.element.dataset.y = data_y;
		obj.element.dataset.z = data_z;
		obj.element.style.zIndex = data_y * 2 + (data_x % 2 !== 0 ? 1 : 0) + 1000;
		obj.element.style.top = (currentH / 2 + obj.point.y) + "px";
		obj.element.style.left = (currentW / 2 + obj.point.x) + "px";
		obj.element.style.backgroundImage = "url('" + map_config.tileset[obj.type].img + "')";
		map_config.element.appendChild(obj.element);

		tiles[data_x + "," + data_y] = obj;
		return obj;
	}
}

//helpers
let checkValidPosition = (x, y) =>
	(x >= -Math.ceil(map_config.map.dimensions.x / 2) &&
		x <= Math.floor(map_config.map.dimensions.x / 2)) &&
	(y >= -Math.ceil(map_config.map.dimensions.y / 2) &&
		y <= Math.floor(map_config.map.dimensions.y / 2))

let calcMaxXTiles = () =>
	Math.min(map_config.map.dimensions.x, Math.ceil(currentW / map_config.tile.dimensions * 2.6));

let calcMaxYTiles = () =>
	Math.min(map_config.map.dimensions.y, Math.ceil(currentH / map_config.tile.dimensions * 2.8));


let currentMaxX = () => {
	let i = 0;
	while (tiles[i + ",0"] && tiles[i + ",0"].element && tiles[i + ",0"].element.parentElement)
		i++;
	return i-1;
}
let currentMinX = () => {
	let i = 0;
	while (tiles[i + ",0"] && tiles[i + ",0"].element && tiles[i + ",0"].element.parentElement)
		i--;
	return i+1;
}
let currentMaxY = () => {
	let i = 0;
	while (tiles["0," + i] && tiles["0," + i].element && tiles["0," + i].element.parentElement)
		i++;
	return i-1;
}
let currentMinY = () => {
	let i = 0;
	while (tiles["0," + i] && tiles["0," + i].element && tiles["0," + i].element.parentElement)
		i--;
	return i+1;
}

let moveTile = (el) => {
	if(el)
	{
		el.element.style.left = (el.point.x + currentW / 2 - posX * map_config.tile.dimensions / 2) + "px";
		el.element.style.top = (el.point.y + currentH / 2 - posY * map_config.tile.dimensions / 2) + "px";
	}
}

let moveTiles = () => {
	let newPosX = posX + movementX, newPosY = posY + movementY;
	if (-newPosX > Math.ceil(map_config.map.dimensions.x / 2))
		movementX = -Math.ceil(map_config.map.dimensions.x / 2) - posX;
	else
		if (newPosX > Math.floor(map_config.map.dimensions.x / 2))
			movementX = Math.floor(map_config.map.dimensions.x / 2) - posX;
	if (-newPosY > Math.ceil(map_config.map.dimensions.y / 2))
		movementY = -Math.ceil(map_config.map.dimensions.y / 2) - posY;
	else
		if (newPosY > Math.floor(map_config.map.dimensions.y / 2))
			movementY = Math.floor(map_config.map.dimensions.y / 2) - posY;
	rendertiles("move");
}


window.onload = () => main();
//error handling
window.onerror = function (error, url, line) {
	ipc.send('errorInWindow', error, url, line);
};

ipc.on('newCoords', (event, newX, newY) => {
	movementX = newX - posX;
	movementY = newY - posY;
	moveTiles();
});



/*********RIMUOVERE DEBUGGING***********/
document.addEventListener("keydown", function (e) {
	if (e.which === 123) {
		require('electron').remote.getCurrentWindow().toggleDevTools();
	} else if (e.which === 116) {
		location.reload();
	}
});