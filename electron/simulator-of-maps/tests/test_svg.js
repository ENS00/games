const SVG=require('@svgdotjs/svg.js').SVG;
let draw = SVG().addTo('body').size('100%','100%')
let image=draw.image('../assets/tiles/grass1.png')
image.size(100, 100).animate(1000).move(20, 20)

document.addEventListener("keydown", function (e) {
	if (e.which === 123) {
		require('electron').remote.getCurrentWindow().toggleDevTools();
	} else if (e.which === 116) {
		location.reload();
	}
});