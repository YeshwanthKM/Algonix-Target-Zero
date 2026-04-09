/*==============================================================================
Init
==============================================================================*/
$.TextPop = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.alpha = 2;
	this.vy = 0;
};

/*==============================================================================
Update
==============================================================================*/
$.TextPop.prototype.update = function( i ) {
	this.vy -= 0.05;
	this.y += this.vy * $.dt;
	this.alpha -= 0.03 * $.dt;

	if( this.alpha <= 0 ){
		$.textPops.splice( i, 1 );
	}
};

/*==============================================================================
Render
==============================================================================*/
$.TextPop.prototype.render = function( i ) {
	$.ctxmg.save();
	$.ctxmg.font = "bold 20px 'Courier New', Courier, monospace";
	$.ctxmg.textBaseline = "middle";
	$.ctxmg.textAlign = "center";
	$.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, ' + this.alpha + ')';
	$.ctxmg.shadowBlur = 10;
	$.ctxmg.shadowColor = $.ctxmg.fillStyle;
	$.ctxmg.fillText('+' + this.value, this.x, this.y);
	$.ctxmg.restore();
}