const offset=12000;

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

	let rand=noise.simplex2(data_x / (map_config.map.biomeWidth*map_config.map.worldStretching)+offset,
													data_y / (map_config.map.biomeWidth/map_config.map.worldStretching)+offset);
	this.biome = map_config.biomes[Math.round(map(rand, -1, 1, 0, map_config.biomes.length - 1))];
	let biometileset=this.biome.tileset;

	//rand from -1 to 1 using seed
	rand=noise.simplex2(data_x / (map_config.map.terrainVariance*map_config.map.worldStretching)+offset,
											data_y / (map_config.map.terrainVariance/map_config.map.worldStretching)+offset);
	this.type = biometileset[Math.round(map(rand, -1, 1, 0, biometileset.length - 1))];
	// if is high elevated set biome to mountain or volcano
	if(this.biome.name=="mountain" || this.biome.name=="volcano")
		this.setZ(Math.round(map(findTypeInBiome(this.type,this.biome), 0, biometileset.length - 1, 0, 3)));
	else
	if(this.biome.name!="swamp" && this.biome.name!="ocean")//ocean will spawn islands
		this.setZ(Math.round(map(findTypeInBiome(this.type,this.biome), 0, biometileset.length - 1, 0, 1)));
	else
		this.setZ(0);
		
  //this.objects = [];//to add floating players or something

}
let findTypeInBiome = (val, biome) => {
	return biome.tileset.indexOf(val)
}
let map = (val, min = 0, max = 1, pref_min = 0, pref_max = 100) => {
	if (pref_min < pref_max && min < max && val <= max)
		return (val - min) / (max - min) * (pref_max - pref_min) + pref_min;
}
let fixNumber=(num,precision=3)=>
	parseFloat(num.toFixed(precision))

module.exports.map = map;
module.exports.fixNumber = fixNumber;