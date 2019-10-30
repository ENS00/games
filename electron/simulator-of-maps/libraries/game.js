module.exports.Tile = function (map_config, data_x, data_y, data_z=0) {
	this.changetype = t => {
		this.type = t;
		this.element.style.backgroundImage = "url('" + map_config.tileset[t].img + "')";
	};
	this.element = document.createElement("div");
	this.position = {
		x:data_x,
		y:data_y,
		z:data_z
	}
	this.point = {
		x: fixNumber(data_x * map_config.tile.dimensions / 2),
    y: fixNumber((data_y-data_z) * map_config.tile.dimensions / 2 + Math.abs(data_x % 2) * map_config.tile.dimensions / 4)
	}
  this.setZ=(z)=>{
		this.position.z = z;
		this.point.y = fixNumber((this.position.y-this.position.z) * map_config.tile.dimensions / 2 + Math.abs(data_x % 2) * map_config.tile.dimensions / 4);
  }

	//rand from -1 to 1 using seed
	let rand=noise.simplex2(data_x / 50, data_y / 50);
	this.type = Math.round(map(rand, -1, 1, 0, map_config.tileset.length - 1));
	if(this.type<4)
		this.setZ(0);
	else
		this.setZ(Math.round(map(this.type, 4, map_config.tileset.length - 1, 0, 2)));
  this.objects = [];//to add floating players or something

	/*
		check if hill or valley lava,water ecc.
	*/
}
let map = (val, min = 0, max = 1, pref_min = 0, pref_max = 100) => {
	if (pref_min < pref_max && min < max && val <= max)
		return (val - min) / (max - min) * (pref_max - pref_min) + pref_min;
}
let fixNumber=(num,precision=3)=>
	parseFloat(num.toFixed(precision))

module.exports.map = map;
module.exports.fixNumber = fixNumber;